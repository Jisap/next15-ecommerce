import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";


export default function Home() {
  return (
    <div className="p-4">
      <div className="flex flex-col gap-y-4">
        <div>
          <Button variant="elevated">
            Button
          </Button>
        </div>

        <div>
          <Input 
            placeholder="input"
          />
        </div>

        <div>
          <Progress value={50} />
        </div>

        <div>
          <Textarea placeholder="Textarea"/>
        </div>

        <div>
          <Checkbox />
        </div>
      </div>
    </div>
  );
}
