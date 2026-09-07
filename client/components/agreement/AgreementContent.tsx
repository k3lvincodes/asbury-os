interface AgreementContentProps {
  content: string;
  version: string;
}

export default function AgreementContent({ content, version }: AgreementContentProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-navy">Rental Agreement</h2>
        <span className="text-sm text-gray-500">Version {version}</span>
      </div>
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
