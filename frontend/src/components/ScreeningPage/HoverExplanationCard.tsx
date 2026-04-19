import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type HoverCardProps = {
  title: string;
  description: string,
  children: React.ReactNode;
};

function HoverExplanationCard({ title, description, children }: HoverCardProps) {
  return (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger asChild>
          {children
        }</HoverCardTrigger>
      <HoverCardContent className="flex w-64 flex-col gap-0.5">
        <div className="font-semibold">{title}</div>
        <div>{description}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Husk at vår KI kan gjøre feil.
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
export default HoverExplanationCard;
