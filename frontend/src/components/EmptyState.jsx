import { FolderOpenIcon } from '@heroicons/react/24/outline';

export default function EmptyState({ title, message, icon: Icon = FolderOpenIcon, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-gray-100 border-dashed">
      <div className="w-16 h-16 bg-primary-50 text-primary-900 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
