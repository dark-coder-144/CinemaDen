import { Menu } from "lucide-react"
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet"
import { Button } from "./ui/button"
import { NavigationSidebar } from "./navigation/navigation-sidebar"
import { ServerSidebar } from "./server/server-sidebar"
export const MobileToggle = ({
    serverId
}: {serverId: string}) =>{
    return (
        <Sheet>
            <SheetTrigger>
                <Menu className="md:hidden"/>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex gap-0">
                <section className="w-[72px]">
                    <NavigationSidebar/>
                </section>
                <ServerSidebar serverId={serverId}/>
            </SheetContent>
        </Sheet>
    )
}