"use client"

import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { useModal } from "@/hooks/use-modal-store"
import { Button } from "../ui/button";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";


export const DeleteServerModal = () => {
    const {isOpen, onClose, type, data} = useModal();   
    const router = useRouter();
    const isModalOpen = isOpen && type === "deleteServer";
    const {server} = data;

    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try{
            setIsLoading(true);
            await axios.delete(`/api/servers/${server?.id}`);
            onClose();
            router.refresh();
            router.push("/");
        }
        catch(error){
            console.log(error);
        }
        finally{
            setIsLoading(false);
        }
    }
    return (
        <div>
        <Dialog open={isModalOpen} onOpenChange={onClose}>
 
        <DialogContent className="bg-black text-white p-0 overflow-hidden">
            <DialogHeader className="pt-8 px-6">
            <DialogTitle className="text-2xl text-center font-bold">Delete Server</DialogTitle>
            <DialogDescription className="text-center text-zinc-500">
                Are you sure you want to do this? <br/> <span className="font-semibold text-yellow-500">{server?.name}</span> will be permanently deleted.
            </DialogDescription>
            </DialogHeader>
            <DialogFooter className="bg-black px-6 py-4">
                <div className="flex items-center justify-between w-full">
                    <Button disabled={isLoading} onClick={onClose} variant="ghost">
                        Cancel
                    </Button>
                    <Button disabled={isLoading} variant="primary" onClick={onClick}>
                        Confirm
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
        </Dialog>

        </div>
    )
}