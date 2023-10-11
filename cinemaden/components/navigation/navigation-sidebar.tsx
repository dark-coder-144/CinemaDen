import { currentProfile } from "@/lib/current-profile"
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { NavigationAction } from "./navigation-action";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavigationItem } from "./navigation-item";
import { UserButton } from "@clerk/nextjs";

export const NavigationSidebar = async () => {
    const profile = await currentProfile();
    if(!profile) return redirect("/");
    const servers = await db.server.findMany({
        where: {
            members: {
                some: {
                    profileId: profile.id
                }
            }
        }
    })
    
    return(
        <div className="space-y-4 flex flex-col items-center h-full text-primary w-full bg-[#111111] py-3">
           <NavigationAction/>
           <Separator className="h-[2px] bg-zinc-400 rounded-md w-10 mx-auto"/>
           <ScrollArea className="flex-1 w-full">
                {servers.map((server)=> (
                    <div key={server.id}>
                        <NavigationItem 
                        id={server.id}
                        name={server.name}
                        imageUrl={server.imageUrl}
                        />
                    </div>
                ))}
           </ScrollArea>
           <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
                <UserButton afterSignOutUrl="/" appearance={{elements: {
                    avatarBox: "h-[48px] w-[48px]"
                }}}/>
           </div>
        </div>
    )
}