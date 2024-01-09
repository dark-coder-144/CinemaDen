"use client"
import qs from "query-string"
import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {Input} from "@/components/ui/input"
import {Button} from "@/components/ui/button"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useModal } from "@/hooks/use-modal-store"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { ChannelType } from "@prisma/client"
import { useEffect } from "react"

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Channel name is required."
    }).refine(
        name=>name!=="general",
        {
            message: "Channel name cannot be 'general'"
        }
    ),
    type: z.nativeEnum(ChannelType)
});

export const EditChannelModal = () => {
    const {isOpen, onClose, type, data} = useModal();   
    const router = useRouter();

    const isModalOpen = isOpen && type === "editChannel";
    const {channel, server} = data;
    
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues:{
            name: "",
            type: channel?.type || ChannelType.TEXT,
        }
    });

    useEffect(()=>{
        if(channel){
            form.setValue("name", channel.name);
            form.setValue("type", channel.type);
        }
    }, [channel, form])
    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
       try{
        const url = qs.stringifyUrl({
            url: `/api/channels/${channel?.id}`,
            query: {
                serverId: server?.id
            }
        });
        await axios.patch(url, values);
        
        form.reset();
        router.refresh();
        onClose();
       }
       catch(error){
        console.log(error);
       }
    }

    const handleClose = () => {
        form.reset();
        onClose();
    }
    
    return (
        <div>
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="bg-black text-white p-0 overflow-hidden">
            <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">Edit Channel</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-5 px-6">
                        <FormField control={form.control} name="name" render={({field})=>(
                            <FormItem>
                                <FormLabel className="uppercase text-xs font bold text-zinc-500">
                                    Channel Name
                                </FormLabel>
                                <FormControl>
                                    <Input disabled={isLoading} className="bg-white border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0" placeholder="Enter channel name" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>   
                        <FormField
                            control={form.control}
                            name="type"
                            render={({field})=>(
                                <FormItem>
                                    <FormLabel>Channel Type</FormLabel>
                                    <Select disabled={isLoading}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-white border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0 capitalize outline-none">
                                                <SelectValue placeholder="Select a Channel Type"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(ChannelType).map((type)=>(
                                            <SelectItem key={type} value={type} className="capitalize">
                                                {type.toLowerCase()}
                                            </SelectItem> 
                                            ))}    
                                        </SelectContent>    
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <DialogFooter className="px-6 pb-6">
                        <Button variant="primary" disabled={isLoading} className="w-full">
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
        </Dialog>

        </div>
    )
}