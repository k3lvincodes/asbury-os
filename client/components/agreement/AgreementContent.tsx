interface AgreementContentProps {
  content: string;
  version: string;
}

export default function AgreementContent({ content, version }: AgreementContentProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-navy">Rental Agreement</h2>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">v{version}</span>
      </div>
      <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: '60vh' }}>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
