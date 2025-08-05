import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

type URLFormData = z.infer<typeof urlSchema>;

interface APIResponse {
  [key: string]: any;
}

const URLInputPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<URLFormData>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (url: string): Promise<APIResponse> => {
      const response = await fetch("http://localhost:9000/automation/parse-website", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ website: url }),
      });

      if (!response.ok) {
        throw new Error("Failed to process URL");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Website data processed successfully",
      });
      navigate("/business-info", { state: { businessData: data } });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process URL",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: URLFormData) => {
    submitMutation.mutate(data.url);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Business Information Extractor</CardTitle>
          <CardDescription>
            Enter your website URL to automatically extract business information, or skip to enter manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                        disabled={submitMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {submitMutation.isPending ? "Processing..." : "Extract Business Info"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/business-info")}
                  disabled={submitMutation.isPending}
                >
                  Skip and Enter Manually
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default URLInputPage;