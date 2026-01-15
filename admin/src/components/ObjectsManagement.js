import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ObjectsManagement.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function ObjectsManagement() {
  const [objects, setObjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingObject, setEditingObject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    size: '',
    logo: ''
  });

  useEffect(() => {
    loadObjects();
  }, []);

  const loadObjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/objects`);
      setObjects(response.data);
    } catch (error) {
      console.error('Error loading objects:', error);
      alert('Failed to load objects');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingObject) {
        await axios.put(`${API_BASE_URL}/admin/objects/${editingObject._id}`, formData);
      } else {
        await axios.post(`${API_BASE_URL}/admin/objects`, formData);
      }
      setShowModal(false);
      setEditingObject(null);
      setFormData({ name: '', size: '', logo: '' });
      loadObjects();
    } catch (error) {
      console.error('Error saving object:', error);
      alert('Failed to save object');
    }
  };

  const handleEdit = (obj) => {
    setEditingObject(obj);
    setFormData({
      name: obj.name,
      size: obj.size.toString(),
      logo: obj.logo || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this object?')) {
      try {
        await axios.delete(`${API_BASE_URL}/admin/objects/${id}`);
        loadObjects();
      } catch (error) {
        console.error('Error deleting object:', error);
        alert('Failed to delete object');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingObject(null);
    setFormData({ name: '', size: '', logo: '' });
  };

  const formatSize = (size) => {
    if (size >= 1024) {
      return `${(size / 1024).toFixed(2)} GB`;
    }
    return `${size.toFixed(2)} MB`;
  };

  return (
    <div className="objects-management">
      <div className="page-header">
        <h2>Objects Management</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Create New Object
        </button>
      </div>

      {objects.length === 0 ? (
        <div className="empty-state">
          <p>No objects found. Create your first object to get started.</p>
        </div>
      ) : (
        <div className="objects-table-container">
          <table className="objects-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Name</th>
                <th>Size</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {objects.map((obj) => (
                <tr key={obj._id}>
                  <td>
                    {obj.logo ? (
                      <img 
                        src={obj.logo.startsWith('data:') ? obj.logo : `data:image/png;base64,${obj.logo}`}
                        alt={obj.name}
                        className="object-logo-small"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="no-logo">No Logo</div>
                    )}
                  </td>
                  <td>{obj.name}</td>
                  <td>{formatSize(obj.size)}</td>
                  <td>{new Date(obj.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(obj)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(obj._id)} className="btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingObject ? 'Edit Object' : 'Create New Object'}</h3>
              <button onClick={handleCloseModal} className="modal-close">×</button>
            </div>
            <form onSubmit={handleSubmit} className="object-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Size (MB)</label>
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Logo (Image)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                {formData.logo && (
                  <img 
                    src={formData.logo.startsWith('data:') ? formData.logo : `data:image/png;base64,${formData.logo}`}
                    alt="Preview"
                    className="logo-preview"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingObject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ObjectsManagement;
