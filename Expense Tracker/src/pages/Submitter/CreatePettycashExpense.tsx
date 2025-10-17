import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Forms/Input';
import SelectDropdown from '../../components/Forms/SelectionDropDown';
import EnhancedInput from '../../components/Forms/EnhancedInput';

const officeOptions = [
  { value: 'lahore', label: 'Lahore' },
  { value: 'multan', label: 'Multan' },
];

const pettyCashOptions = [
  { value: 'pc-1', label: 'PC-001' },
  { value: 'pc-2', label: 'PC-002' },
];

const CreatePettycashExpense: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    office: 'lahore',
    title: '',
    description: '',
    paymentDate: '',
    amount: '',
    pettyCashId: '',
  });

  const handleChange = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // submit to API when ready
    console.log('submit pettycash expense', form);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-12 xs:h-14 sm:h-16">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900">Create Pettycash Expense</h1>
              <p className="text-sm text-gray-500">Add a new petty cash expense</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <div>
            <SelectDropdown
              label="Office"
              options={officeOptions}
              value={officeOptions.find(o => o.value === form.office) || null}
              onChange={(opt:any) => handleChange('office', opt?.value)}
            />
          </div>

          <div>
            <EnhancedInput label="Title" value={form.title} onChange={(v) => handleChange('title', v)} placeholder="Expense title" />
          </div>

          <div>
            <textarea placeholder="Enter description"
            rows={4}
            className="w-full border border-gray-300 rounded-xl sm:rounded-lg p-3 sm:p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none" value={form.description} onChange={(v) => handleChange('description', v)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <EnhancedInput label="Payment Date" type="date" value={form.paymentDate} onChange={(v) => handleChange('paymentDate', v)} />
            </div>

            <div>
              <EnhancedInput label="Amount" type="number" value={form.amount} onChange={(v) => handleChange('amount', v)} />
            </div>
          </div>

          <div>
            <SelectDropdown label="PettyCash ID" options={pettyCashOptions} value={pettyCashOptions.find(o => o.value === form.pettyCashId) || null} onChange={(opt:any) => handleChange('pettyCashId', opt?.value)} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded border bg-white">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePettycashExpense;
