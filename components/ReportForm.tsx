
import React, { useState, useRef } from 'react';
import { ReportType } from '../types';

interface ReportFormProps {
  type: ReportType;
  onSubmit: (data: any) => void;
  loading: boolean;
}

const CATEGORIES = ['Electronics', 'ID Cards', 'Wallet/Bags', 'Keys', 'Stationery', 'Clothing', 'Books', 'Other'];

const SHIRPUR_LOCATIONS = [
  'Academic Block A', 
  'Academic Block B', 
  'Library', 
  'Central Canteen', 
  'Boys Hostel 1', 
  'Boys Hostel 2', 
  'Girls Hostel', 
  'Sports Ground', 
  'Auditorium', 
  'Gymnasium',
  'Workshop Area'
];

const ReportForm: React.FC<ReportFormProps> = ({ type, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    location: '',
    category: 'Other',
    dateTime: new Date().toISOString().slice(0, 16),
  });
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const requestPermission = async (target: 'camera' | 'gallery') => {
    try {
      if (target === 'camera') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        cameraInputRef.current?.click();
      } else {
        fileInputRef.current?.click();
      }
    } catch (err) {
      alert('Permission denied. Please enable camera/gallery access.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === ReportType.FOUND) {
      if (!image) {
        alert('An image is required for Found reports to ensure security.');
        return;
      }
    }
    
    const sensitiveCats = ['ID Cards', 'Wallet/Bags'];
    const isSensitive = sensitiveCats.includes(formData.category);

    onSubmit({ ...formData, imageUrl: image, type, isSensitive });
  };

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-10 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">
          {type === ReportType.LOST ? 'Report Lost Item' : 'Report Found Item'}
        </h2>
        <p className="text-slate-500">Reports are restricted to NMIMS Shirpur Campus locations.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-xl space-y-6 border border-slate-100">
        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
        <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-full">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Item Category</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat})}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    formData.category === cat 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Item Name</label>
            <input 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Blue Backpack, Student ID"
              value={formData.itemName}
              onChange={e => setFormData({...formData, itemName: e.target.value})}
            />
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Item Image {type === ReportType.FOUND && <span className="text-red-500">*Mandatory</span>}
            </label>
            {image ? (
              <div className="relative group">
                <img src={image} className="w-full h-48 object-cover rounded-2xl border-2 border-indigo-100" />
                <button 
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full shadow-lg"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => requestPermission('camera')}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 text-slate-400"
                >
                  <i className="fas fa-camera text-xl mb-1"></i>
                  <span className="text-[10px] font-bold uppercase">Camera</span>
                </button>
                <button 
                  type="button"
                  onClick={() => requestPermission('gallery')}
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 text-slate-400"
                >
                  <i className="fas fa-images text-xl mb-1"></i>
                  <span className="text-[10px] font-bold uppercase">Gallery</span>
                </button>
              </div>
            )}
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea 
              required
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Describe the item clearly. Gemini AI will automatically generate a verification question based on your details."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Campus Location</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {SHIRPUR_LOCATIONS.map(loc => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setFormData({...formData, location: loc})}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                    formData.location === loc 
                      ? 'bg-amber-100 border-amber-300 text-amber-700 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-amber-200'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
            <input 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Or type specific location (e.g. Room 204)"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Time</label>
            <input 
              required
              type="datetime-local"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.dateTime}
              onChange={e => setFormData({...formData, dateTime: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all ${
            loading ? 'bg-slate-400' : (type === ReportType.LOST ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700')
          }`}
        >
          {loading ? <i className="fas fa-circle-notch fa-spin"></i> : <span>Submit to Shirpur Feed</span>}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
