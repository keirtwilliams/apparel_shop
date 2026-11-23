import React, { useState } from 'react';
import { X } from '@phosphor-icons/react';

export default function SizeChartModal({ isOpen, onClose, category = 'Tops' }) {
  const [unit, setUnit] = useState('cm'); // 'cm' | 'in'

  if (!isOpen) return null;

  const topsMeasurements = [
    { size: 'S', chestCm: '108', shoulderCm: '50', lengthCm: '70', chestIn: '42.5', shoulderIn: '19.7', lengthIn: '27.5' },
    { size: 'M', chestCm: '114', shoulderCm: '52', lengthCm: '72', chestIn: '44.8', shoulderIn: '20.5', lengthIn: '28.3' },
    { size: 'L', chestCm: '120', shoulderCm: '54', lengthCm: '74', chestIn: '47.2', shoulderIn: '21.3', lengthIn: '29.1' },
    { size: 'XL', chestCm: '126', shoulderCm: '56', lengthCm: '76', chestIn: '49.6', shoulderIn: '22.0', lengthIn: '29.9' },
  ];

  const bottomsMeasurements = [
    { size: 'S', waistCm: '76-80', inseamCm: '74', riseCm: '30', waistIn: '30-31', inseamIn: '29.1', riseIn: '11.8' },
    { size: 'M', waistCm: '81-85', inseamCm: '75', riseCm: '31', waistIn: '32-33', inseamIn: '29.5', riseIn: '12.2' },
    { size: 'L', waistCm: '86-90', inseamCm: '76', riseCm: '32', waistIn: '34-35', inseamIn: '29.9', riseIn: '12.6' },
    { size: 'XL', waistCm: '91-96', inseamCm: '77', riseCm: '33', waistIn: '36-38', inseamIn: '30.3', riseIn: '13.0' },
  ];

  const isBottom = category === 'Bottoms';
  const tableData = isBottom ? bottomsMeasurements : topsMeasurements;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-xs">
      <div 
        className="bg-canvas border border-border rounded-card max-w-lg w-full p-6 shadow-lg relative animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-chart-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 id="size-chart-title" className="text-base font-semibold text-primary">
              Garment Sizing Specifications
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Architectural cut measurements ({category})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-input text-muted hover:text-primary hover:bg-surface transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Unit Selector */}
        <div className="flex items-center justify-between my-4 text-xs">
          <span className="text-muted">Unit of measurement</span>
          <div className="flex bg-surface p-0.5 rounded-input border border-border">
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded-input font-medium transition-colors ${
                unit === 'cm' ? 'bg-primary text-canvas' : 'text-muted hover:text-primary'
              }`}
            >
              Centimeters (cm)
            </button>
            <button
              onClick={() => setUnit('in')}
              className={`px-3 py-1 rounded-input font-medium transition-colors ${
                unit === 'in' ? 'bg-primary text-canvas' : 'text-muted hover:text-primary'
              }`}
            >
              Inches (in)
            </button>
          </div>
        </div>

        {/* Measurement Table */}
        <div className="overflow-x-auto border border-border rounded-tight">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface text-muted uppercase tracking-wider border-b border-border">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Size</th>
                {isBottom ? (
                  <>
                    <th className="py-2.5 px-3 font-semibold">Waist</th>
                    <th className="py-2.5 px-3 font-semibold">Inseam</th>
                    <th className="py-2.5 px-3 font-semibold">Front Rise</th>
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-3 font-semibold">Chest Circumference</th>
                    <th className="py-2.5 px-3 font-semibold">Shoulder Width</th>
                    <th className="py-2.5 px-3 font-semibold">Body Length</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border tabular-nums">
              {tableData.map(row => (
                <tr key={row.size} className="hover:bg-surface/50 transition-colors">
                  <td className="py-2 px-3 font-medium text-primary">{row.size}</td>
                  {isBottom ? (
                    <>
                      <td className="py-2 px-3 text-muted">{unit === 'cm' ? row.waistCm : row.waistIn}</td>
                      <td className="py-2 px-3 text-muted">{unit === 'cm' ? row.inseamCm : row.inseamIn}</td>
                      <td className="py-2 px-3 text-muted">{unit === 'cm' ? row.riseCm : row.riseIn}</td>
                    </>
                  ) : (
                    <>
                      <td className="py-2 px-3 text-muted">{unit === 'cm' ? row.chestCm : row.chestIn}</td>
                      <td className="py-2 px-3 text-muted">{unit === 'cm' ? row.shoulderCm : row.shoulderIn}</td>
                      <td className="py-2 px-3 text-muted">{unit === 'cm' ? row.lengthCm : row.lengthIn}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fit Advisory Footer */}
        <div className="mt-4 p-3 bg-surface rounded-input text-xs text-muted leading-relaxed">
          <span className="font-semibold text-primary">Fit Guidance: </span>
          Garments are cut for an architectural drape. If you prefer a tailored, slim fit rather than our signature relaxed volume, we advise selecting one size down.
        </div>

        {/* Action Button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary text-canvas text-xs font-semibold tracking-wider uppercase rounded-tight hover:opacity-90 transition-opacity min-h-[44px]"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
