import BotCard from "../BotCard";

export default function BotCardExample() {
  return (
    <div className="p-8 bg-background space-y-4 max-w-md">
      <BotCard
        id="1"
        containerName="Pookie-Bot1"
        status="running"
        phone="2348012345678"
        prefix="!"
        createdAt="2 days ago"
      />
      <BotCard
        id="2"
        containerName="MyWA-Bot"
        status="stopped"
        phone="2349087654321"
        prefix="."
        createdAt="5 days ago"
      />
    </div>
  );
}
