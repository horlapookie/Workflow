import LiveLogsPanel from "../LiveLogsPanel";

export default function LiveLogsPanelExample() {
  return (
    <div className="bg-background min-h-screen relative">
      <div className="p-8">
        <p className="text-muted-foreground">Content above logs panel...</p>
      </div>
      <LiveLogsPanel />
    </div>
  );
}
