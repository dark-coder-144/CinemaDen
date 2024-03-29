"use client"

import { Member, MemberRole, Profile } from "@prisma/client";
import { UserAvatar } from "../user-avatar";
import { ActionTooltip } from "../action-tooltip";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import * as z from "zod"
import qs from "query-string"
import axios from "axios"
import {Form, FormControl, FormField, FormItem} from "@/components/ui/form"
import {useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/use-modal-store";
import {useRouter, useParams} from "next/navigation"
interface ChatItemProps{
    id: string;
    content: string;
    member: Member & {
        profile: Profile;
    }
    timestamp: string;
    fileUrl: string | null;
    deleted: boolean;
    currentMember: Member;
    isUpdated: boolean;
    socketUrl: string;
    socketQuery: Record<string, string>;
}

const roleIconMap = {
    "GUEST": null,
    "MODERATOR": <ShieldCheck className="w-4 h-4 ml-2 text-green-500"/>,
    "ADMIN": <ShieldAlert className="w-4 h-4 ml-2 text-red-700"/>,
}

const formSchema = z.object({
    content: z.string().min(1),
})

export const ChatItem = ({
    id, content, member, timestamp, fileUrl, deleted, currentMember, isUpdated, socketUrl, socketQuery
}: ChatItemProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const { onOpen } = useModal();
    const params = useParams();
    const router = useRouter();

    const onMemberClick = () => {
        if(member.id===currentMember.id){
            return;
        }
        router.push(`/servers/${params?.serverId}/conversations/${member.id}`)
    }

    useEffect(()=>{
        const handleKeyDown = (event: any) => {
            if(event.key === "Escape" || event.keyCode === 27){
                setIsEditing(false);
            }
        }
        window.addEventListener('keydown', handleKeyDown)

        return () => window.removeEventListener("keyDown", handleKeyDown)
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: content
        }
    });

    useEffect(()=> {
       form.reset({
        content: content,
       }) 
    }, [content])

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{
            const url = qs.stringifyUrl({
                url: `${socketUrl}/${id}`,
                query: socketQuery,
            })
            await axios.patch(url, values)
            form.reset()
            setIsEditing(false);
        }catch(error){
            console.log(error)
        }
    }
    
    const fileType = fileUrl?.split(".").pop();
    const isAdmin = currentMember.role === MemberRole.ADMIN;
    const isModerator = currentMember.role === MemberRole.MODERATOR;
    const isOwner = currentMember.id === member.id;
    const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
    const canEditMessage = !deleted && isOwner && !fileUrl;
    const isPDF = fileType==="pdf" && fileUrl;
    const isImage = !isPDF && fileUrl;

    return(
        <div className="relative group flexitems-center hover:bg-black/5 p-4 tgransition w-full">
            <div className="group flex gap-x-2 items-start w-full">
                <div onClick={onMemberClick} className="cursor-pointer hover:frop-shadow-md transition">
                    <UserAvatar src = {member.profile.imageUrl}/>
                </div>
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-x-2">
                        <div className="flex items-center">
                            <p onClick={onMemberClick} className="font-semibold text-sm hover:underline cursor-pointer">
                                {member.profile.name}
                            </p>
                            <ActionTooltip label={member.role}>
                                {roleIconMap[member.role]}
                            </ActionTooltip>
                        </div>
                        <span className="text-xs text-zinc-400">
                            {timestamp}
                        </span>
                    </div>
                    {isImage && (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-md mt-2 overflow-hidden border-flex items-center bg-secondary h-48 w-48">
                            <Image src={fileUrl} alt={content} fill className="object-cover"/>                            
                        </a>
                    )}
                    {isPDF && (
                        <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
                            <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400"/>
                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm - text-indigo-400 hover:underline">
                                    PDF File
                            </a>
                        </div>
                    )}
                    {!fileUrl && !isEditing && (
                        <p className={cn("text-zinc-300 text-sm", deleted && "italic text-zinc-400 text-xs mt-1")}>
                            {content}
                            {isUpdated && !deleted && (
                                <span className="text-[10px] text-zinc-400 mx-2">
                                    (edited)
                                </span>
                            )}
                        </p>
                    )}
                    {!fileUrl && isEditing && (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center w-full gap-x-2 pt-2">
                               <FormField control={form.control} name="content" render={({field})=>(
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <div className="relative w-full">
                                            <Input disabled={isLoading} {...field} className="p-2 bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-200" placeholder="Edited message"/>
                                        </div>
                                    </FormControl>
                                </FormItem>
                               )}/> 
                               <Button disabled={isLoading} size="sm" variant="primary">
                                    Save
                               </Button>
                            </form>
                            <span className="text-[10px] mt-1 text-zinc-400">
                                Press Escape to Cancel, Enter to Save
                            </span>
                        </Form>
                    )}
                </div>
            </div>
            {canDeleteMessage && (
                <div className="hidden group-hover:flex items-center gap-x-2 absolute o-1 -top-2 right-5 bg-zinc-800 border rounded-sm">
                    {canEditMessage && (
                        <ActionTooltip label="Edit">
                            <Edit onClick={()=> setIsEditing(true)} className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-300 transition"/>
                        </ActionTooltip>
                    )}
                    <ActionTooltip label="Delete">
                        <Trash onClick={()=> onOpen("deleteMessage", {apiUrl: `${socketUrl}/${id}`, query: socketQuery})}
                         className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-300 transition"/>
                    </ActionTooltip>
                </div>
            )}
        </div>
    )
}