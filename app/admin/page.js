'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pnrs, setPnrs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPnr, setEditingPnr] = useState(null);
  const [formData, setFormData] = useState({
    pnr: '',
    train: '',
    route: '',
    distance: '',
    estimatedTime: '',
    passengers: [],
    connections: []
  });
  const [passengerForm, setPassengerForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    berth: ''
  });
  const [connectionForm, setConnectionForm] = useState({
    type: '',
    icon: 'fa-train',
    description: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchPNRs();
    }
  }, [status, router]);

  const fetchPNRs = async () => {
    try {
      const response = await fetch('/api/admin/pnr');
      const data = await response.json();
      if (data.success) {
        setPnrs(data.pnrs);
      }
    } catch (error) {
      console.error('Error fetching PNRs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = editingPnr ? `/api/admin/pnr/${editingPnr._id}` : '/api/admin/pnr';
      const method = editingPnr ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(editingPnr ? 'PNR updated successfully!' : 'PNR created successfully!');
        setShowAddModal(false);
        setEditingPnr(null);
        resetForm();
        fetchPNRs();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving PNR:', error);
      alert('Server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this PNR?')) return;

    try {
      const response = await fetch(`/api/admin/pnr/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('PNR deleted successfully!');
        fetchPNRs();
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting PNR:', error);
      alert('Server error. Please try again.');
    }
  };

  const handleEdit = (pnr) => {
    setEditingPnr(pnr);
    setFormData({
      pnr: pnr.pnr,
      train: pnr.train,
      route: pnr.route,
      distance: pnr.distance,
      estimatedTime: pnr.estimatedTime,
      passengers: pnr.passengers || [],
      connections: pnr.connections || []
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      pnr: '',
      train: '',
      route: '',
      distance: '',
      estimatedTime: '',
      passengers: [],
      connections: []
    });
    setPassengerForm({ name: '', age: '', gender: 'Male', berth: '' });
    setConnectionForm({ type: '', icon: 'fa-train', description: '' });
  };

  const addPassenger = () => {
    if (!passengerForm.name || !passengerForm.age || !passengerForm.berth) {
      alert('Please fill all passenger fields');
      return;
    }
    setFormData({
      ...formData,
      passengers: [...formData.passengers, { ...passengerForm, age: parseInt(passengerForm.age) }]
    });
    setPassengerForm({ name: '', age: '', gender: 'Male', berth: '' });
  };

  const removePassenger = (index) => {
    setFormData({
      ...formData,
      passengers: formData.passengers.filter((_, i) => i !== index)
    });
  };

  const addConnection = () => {
    if (!connectionForm.type || !connectionForm.description) {
      alert('Please fill all connection fields');
      return;
    }
    setFormData({
      ...formData,
      connections: [...formData.connections, { ...connectionForm }]
    });
    setConnectionForm({ type: '', icon: 'fa-train', description: '' });
  };

  const removeConnection = (index) => {
    setFormData({
      ...formData,
      connections: formData.connections.filter((_, i) => i !== index)
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-white text-xl">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc]">
      {/* Header */}
      <header className="fixed top-0 w-full bg-[rgba(13,17,23,0.95)] backdrop-blur-md border-b border-[#30363d] z-50">
        <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between h-[70px]">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
            <i className="fas fa-route text-[#238636] text-2xl"></i>
            <span>Let's Connect - Admin</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-xl text-[#8b949e] hover:bg-[#161b22] transition-all">
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Home
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="pt-[100px] min-h-screen px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">PNR Management</h1>
              <p className="text-[#8b949e]">Manage all PNR records and journey tickets</p>
            </div>
            <button
              onClick={() => {
                setEditingPnr(null);
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <i className="fas fa-plus"></i>
              Add New PNR
            </button>
          </div>

          {/* PNR List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pnrs.map((pnr) => (
              <div key={pnr._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 hover:border-[#238636] transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#238636]">{pnr.pnr}</h3>
                    <p className="text-sm text-[#8b949e]">{pnr.train}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(pnr)}
                      className="w-8 h-8 flex items-center justify-center bg-[#0d1117] border border-[#30363d] rounded-lg hover:border-[#238636] hover:text-[#238636] transition-all"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(pnr._id)}
                      className="w-8 h-8 flex items-center justify-center bg-[#0d1117] border border-[#da3633] rounded-lg hover:bg-[#da3633] hover:text-white transition-all"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><i className="fas fa-route text-[#8b949e] mr-2"></i>{pnr.route}</p>
                  <p><i className="fas fa-ruler text-[#8b949e] mr-2"></i>{pnr.distance}</p>
                  <p><i className="fas fa-clock text-[#8b949e] mr-2"></i>{pnr.estimatedTime}</p>
                  <p><i className="fas fa-users text-[#8b949e] mr-2"></i>{pnr.passengers?.length || 0} passengers</p>
                  <p><i className="fas fa-link text-[#8b949e] mr-2"></i>{pnr.connections?.length || 0} connections</p>
                </div>
              </div>
            ))}
          </div>

          {pnrs.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <i className="fas fa-ticket-alt text-[100px] text-[#30363d] mb-4"></i>
              <h3 className="text-2xl font-bold mb-2">No PNRs Found</h3>
              <p className="text-[#8b949e] mb-6">Get started by adding your first PNR record</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                <i className="fas fa-plus mr-2"></i>
                Add First PNR
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-4xl w-full p-8 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{editingPnr ? 'Edit PNR' : 'Add New PNR'}</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPnr(null);
                  resetForm();
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-[#0d1117] rounded-lg transition-all"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">PNR Number</label>
                  <input
                    type="text"
                    value={formData.pnr}
                    onChange={(e) => setFormData({ ...formData, pnr: e.target.value })}
                    required
                    maxLength={10}
                    className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    placeholder="10-digit PNR"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Train Name & Number</label>
                  <input
                    type="text"
                    value={formData.train}
                    onChange={(e) => setFormData({ ...formData, train: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    placeholder="e.g., 12003 Shatabdi Express"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Route</label>
                  <input
                    type="text"
                    value={formData.route}
                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    placeholder="e.g., New Delhi → Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Distance</label>
                  <input
                    type="text"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    placeholder="e.g., 1,384 km"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Estimated Time</label>
                  <input
                    type="text"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    placeholder="e.g., 15h 50m"
                  />
                </div>
              </div>

              {/* Passengers Section */}
              <div>
                <h3 className="text-xl font-bold mb-4">Passengers ({formData.passengers.length})</h3>
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 mb-4">
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      value={passengerForm.name}
                      onChange={(e) => setPassengerForm({ ...passengerForm, name: e.target.value })}
                      placeholder="Name"
                      className="px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    />
                    <input
                      type="number"
                      value={passengerForm.age}
                      onChange={(e) => setPassengerForm({ ...passengerForm, age: e.target.value })}
                      placeholder="Age"
                      className="px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    />
                    <select
                      value={passengerForm.gender}
                      onChange={(e) => setPassengerForm({ ...passengerForm, gender: e.target.value })}
                      className="px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                    <input
                      type="text"
                      value={passengerForm.berth}
                      onChange={(e) => setPassengerForm({ ...passengerForm, berth: e.target.value })}
                      placeholder="Berth (e.g., A1/15)"
                      className="px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addPassenger}
                    className="px-4 py-2 bg-[#238636] text-white rounded-xl hover:bg-[#2ea043] transition-all"
                  >
                    <i className="fas fa-plus mr-2"></i>Add Passenger
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.passengers.map((passenger, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <i className={`fas ${passenger.gender === 'Male' ? 'fa-mars' : 'fa-venus'} text-[#238636]`}></i>
                        <span>{passenger.name}, {passenger.age}, {passenger.berth}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePassenger(index)}
                        className="text-[#da3633] hover:bg-[#da3633] hover:text-white px-3 py-1 rounded-lg transition-all"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connections Section */}
              <div>
                <h3 className="text-xl font-bold mb-4">Connections ({formData.connections.length})</h3>
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 mb-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      value={connectionForm.type}
                      onChange={(e) => setConnectionForm({ ...connectionForm, type: e.target.value })}
                      placeholder="Type (e.g., Metro)"
                      className="px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    />
                    <select
                      value={connectionForm.icon}
                      onChange={(e) => setConnectionForm({ ...connectionForm, icon: e.target.value })}
                      className="px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    >
                      <option value="fa-train">Train</option>
                      <option value="fa-subway">Metro</option>
                      <option value="fa-bus">Bus</option>
                      <option value="fa-car">Car</option>
                      <option value="fa-taxi">Taxi</option>
                      <option value="fa-motorcycle">Auto</option>
                      <option value="fa-ship">Ferry</option>
                    </select>
                    <input
                      type="text"
                      value={connectionForm.description}
                      onChange={(e) => setConnectionForm({ ...connectionForm, description: e.target.value })}
                      placeholder="Description"
                      className="px-4 py-2 bg-[#161b22] border border-[#30363d] rounded-xl focus:outline-none focus:border-[#238636]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addConnection}
                    className="px-4 py-2 bg-[#238636] text-white rounded-xl hover:bg-[#2ea043] transition-all"
                  >
                    <i className="fas fa-plus mr-2"></i>Add Connection
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.connections.map((connection, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#0d1117] border border-[#30363d] rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <i className={`fas ${connection.icon} text-[#238636]`}></i>
                        <span>{connection.type} - {connection.description}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeConnection(index)}
                        className="text-[#da3633] hover:bg-[#da3633] hover:text-white px-3 py-1 rounded-lg transition-all"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPnr(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-[#30363d] text-[#8b949e] rounded-xl hover:border-[#238636] hover:text-[#238636] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-br from-[#238636] to-[#2ea043] text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</>
                  ) : (
                    <><i className="fas fa-save mr-2"></i>{editingPnr ? 'Update' : 'Create'} PNR</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    </div>
  );
}
