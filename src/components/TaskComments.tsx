
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  user_profiles: {
    email: string;
    full_name: string | null;
  } | null;
}

export const TaskComments = ({ taskId }: { taskId: string }) => {
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: comments = [], isLoading, error: queryError } = useQuery({
    queryKey: ["comments", taskId],
    queryFn: async () => {
      console.log("Fetching comments for task:", taskId);
      
      const { data, error } = await supabase
        .from("task_comments")
        .select(`
          id,
          content,
          created_at,
          user_id,
          user_profiles:user_id (
            email,
            full_name
          )
        `)
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }
      
      console.log("Fetched comments:", data);
      return data as Comment[];
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      console.log("Adding comment:", {
        task_id: taskId,
        content,
        user_id: user.id
      });

      const { data, error } = await supabase
        .from("task_comments")
        .insert([{ 
          task_id: taskId, 
          content,
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) {
        console.error("Error adding comment:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", taskId] });
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error) => {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment);
    }
  };

  if (queryError) {
    console.error("Error in comments query:", queryError);
    return (
      <div className="text-red-500">
        Error loading comments. Please try again later.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-300px)]">
      <form onSubmit={handleSubmit} className="space-y-2 mb-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[80px] resize-none"
        />
        <Button 
          type="submit" 
          disabled={!newComment.trim() || addCommentMutation.isPending}
        >
          Add Comment
        </Button>
      </form>

      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-4">
          {isLoading ? (
            <div>Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-muted-foreground text-center py-4">No comments yet</div>
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className="flex gap-3 p-3 border rounded-lg bg-card/50 hover:bg-card/80 transition-colors"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {comment.user_profiles?.full_name?.[0] || 
                     comment.user_profiles?.email?.[0]?.toUpperCase() || 
                     '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">
                      {comment.user_profiles?.full_name || 
                       comment.user_profiles?.email || 
                       'Anonymous'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
