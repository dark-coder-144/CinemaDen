"use client"

import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { useModal } from "@/hooks/use-modal-store"
import { ServerWithMembersWithProfiles } from "@/types";
import { ScrollArea } from "../ui/scroll-area";
import { UserAvatar } from "../user-avatar";
import { Check, MoreVertical, Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { useState } from "react";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuPortal, DropdownMenuItem, DropdownMenuSeparator
    , DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
const roleIconMap = {
    "GUEST": null,
    "MODERATOR": <ShieldCheck className="h-4 w-4 ml-2 text-lime-600"/>,
    "ADMIN": <ShieldAlert className="h-4 w-4 ml-2 text-rose-700"/>,
}
export const MembersModal = () => {
    const {onOpen, isOpen, onClose, type, data} = useModal();   
    const [loadingId, setLoadingId] = useState("");
    
    const isModalOpen = isOpen && type === "members";
    const {server} = data as {server: ServerWithMembersWithProfiles};
   
    const inviteUrl = `${origin}/invite/${server?.inviteCode}`
    return (
        <div>
        <Dialog open={isModalOpen} onOpenChange={onClose}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="bg-black text-white overflow-hidden">
            <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">Manage Members</DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
                Total Members: {server?.members?.length}
            </DialogDescription>
            </DialogHeader>
            <ScrollArea className="mt-8 max-h-[420px] pr-6">
                {server?.members?.map((member)=>(
                    <div key={member.id} className="flex items-center gap-x-2 mb-6">
                        <UserAvatar src={member.profile.imageUrl}/>
                        <div className="flex flex-col gap-y-1">
                            <div className="text-xs font-semibold flex items-center gap-x-1">
                                {member.profile.name}
                                {roleIconMap[member.role]}
                            </div>
                            <p className="text-xs text-zinc-500">
                                {member.profile.email}
                            </p>
                        </div>
                        {server.profileId!==member.profileId && loadingId!==member.id && (
                            <div className="ml-auto">
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <MoreVertical className="h-4 w-4 text-zinc-500"/>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="left">
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger className="flex items-center">
                                                <ShieldQuestion className="w-4 h-4 mr-2"/>
                                                <span>Role</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem>
                                                        <Shield className="h-4 w-4 mr-2"/>
                                                        Guest
                                                        {member.role==="GUEST" && (
                                                            <Check className="h-4 w-4 ml-auto"/>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                ))}
            </ScrollArea>
        </DialogContent>
        </Dialog>

        </div>
    )
}