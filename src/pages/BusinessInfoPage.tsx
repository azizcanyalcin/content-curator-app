import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { FAQManager, FAQ } from "@/components/FAQManager";

const businessInfoSchema = z.object({
  agentName: z.string().min(1, "Agent name is required"),
  hotelName: z.string().min(1, "Hotel name is required"),
  address: z.string().min(1, "Address is required"),
  concept: z.string().min(1, "Concept is required"),
  restaurantFood: z.string().optional(),
  faqs: z.array(z.object({
    id: z.string(),
    question: z.string(),
    answer: z.string(),
  })).default([]),
  
  // Feature toggles
  reservationEnabled: z.boolean().default(false),
  transferEnabled: z.boolean().default(false),
  restaurantEnabled: z.boolean().default(false),
  spaEnabled: z.boolean().default(false),
  gymEnabled: z.boolean().default(false),
  poolEnabled: z.boolean().default(false),
  businessCenterEnabled: z.boolean().default(false),
  
  // Conditional fields
  reservationLink: z.string().optional(),
  transferPolicy: z.string().optional(),
  
  // Additional features
  features: z.array(z.string()).default([]),
});

type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;

const BusinessInfoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  const businessData = location.state?.businessData;

  const form = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: {
      agentName: "",
      hotelName: "",
      address: "",
      concept: "",
      restaurantFood: "",
      faqs: [],
      reservationEnabled: false,
      transferEnabled: false,
      restaurantEnabled: false,
      spaEnabled: false,
      gymEnabled: false,
      poolEnabled: false,
      businessCenterEnabled: false,
      reservationLink: "",
      transferPolicy: "",
      features: [],
    },
  });

  const reservationEnabled = form.watch("reservationEnabled");
  const transferEnabled = form.watch("transferEnabled");

  useEffect(() => {
    if (businessData) {
      // Populate form with API response data
      const populateForm = () => {
        const updates: Partial<BusinessInfoFormData> = {};
        
        if (businessData.agentName) updates.agentName = businessData.agentName;
        if (businessData.hotelName) updates.hotelName = businessData.hotelName;
        if (businessData.address) updates.address = businessData.address;
        if (businessData.concept) updates.concept = businessData.concept;
        if (businessData.restaurantFood) updates.restaurantFood = businessData.restaurantFood;
        
        // Handle FAQ migration: convert old string format to new array format
        if (businessData.faq) {
          if (typeof businessData.faq === 'string') {
            // Migrate old string FAQ to new format
            const migrationFAQ: FAQ = {
              id: '1',
              question: 'General FAQ',
              answer: businessData.faq
            };
            updates.faqs = [migrationFAQ];
            setFaqs([migrationFAQ]);
          } else if (Array.isArray(businessData.faq)) {
            updates.faqs = businessData.faq;
            setFaqs(businessData.faq);
          }
        }
        
        // Features
        if (businessData.features) {
          updates.reservationEnabled = businessData.features.includes("reservation");
          updates.transferEnabled = businessData.features.includes("transfer");
          updates.restaurantEnabled = businessData.features.includes("restaurant");
          updates.spaEnabled = businessData.features.includes("spa");
          updates.gymEnabled = businessData.features.includes("gym");
          updates.poolEnabled = businessData.features.includes("pool");
          updates.businessCenterEnabled = businessData.features.includes("business_center");
        }
        
        if (businessData.reservationLink) updates.reservationLink = businessData.reservationLink;
        if (businessData.transferPolicy) updates.transferPolicy = businessData.transferPolicy;

        Object.entries(updates).forEach(([key, value]) => {
          form.setValue(key as keyof BusinessInfoFormData, value);
        });
      };

      populateForm();
    }
  }, [businessData, form]);

  const onSubmit = async (data: BusinessInfoFormData) => {
    setIsLoading(true);
    try {
      // Include FAQs in the form data
      const dataWithFAQs = { ...data, faqs };
      console.log("Saving business info:", dataWithFAQs);
      
      toast({
        title: "Success",
        description: "Business information saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save business information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableFeatures = [
    "WiFi",
    "Parking",
    "Pet Friendly",
    "24/7 Reception",
    "Room Service",
    "Laundry Service",
    "Airport Shuttle",
    "Concierge",
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Business Information</h1>
            <p className="text-muted-foreground">
              {businessData ? "Review and update your business details" : "Enter your business information manually"}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential details about your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="agentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter agent name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hotelName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hotel Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter hotel name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter full address" 
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="concept"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concept</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your business concept" 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Restaurant & Food */}
            <Card>
              <CardHeader>
                <CardTitle>Restaurant & Food</CardTitle>
                <CardDescription>
                  Information about dining options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="restaurantFood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant & Food Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your restaurant and food offerings" 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Features & Services */}
            <Card>
              <CardHeader>
                <CardTitle>Features & Services</CardTitle>
                <CardDescription>
                  Select the services and amenities your business offers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reservationEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Reservations</FormLabel>
                          <FormDescription>
                            Enable online reservation system
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transferEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Transfer Service</FormLabel>
                          <FormDescription>
                            Offer airport/city transfer services
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="restaurantEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Restaurant</FormLabel>
                          <FormDescription>
                            On-site restaurant available
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spaEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Spa</FormLabel>
                          <FormDescription>
                            Spa and wellness services
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gymEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Gym</FormLabel>
                          <FormDescription>
                            Fitness center and gym facilities
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="poolEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Swimming Pool</FormLabel>
                          <FormDescription>
                            Swimming pool available
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessCenterEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Business Center</FormLabel>
                          <FormDescription>
                            Business facilities and meeting rooms
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Conditional Fields */}
                {reservationEnabled && (
                  <FormField
                    control={form.control}
                    name="reservationLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reservation Link</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://reservations.example.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          URL where customers can make reservations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {transferEnabled && (
                  <FormField
                    control={form.control}
                    name="transferPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transfer Policy</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your transfer service policy, pricing, and booking requirements" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Details about your transfer service
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Separator />

                {/* Additional Features */}
                <FormField
                  control={form.control}
                  name="features"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Additional Features</FormLabel>
                        <FormDescription>
                          Select all additional amenities that apply
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {availableFeatures.map((feature) => (
                          <FormField
                            key={feature}
                            control={form.control}
                            name="features"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={feature}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(feature)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, feature])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== feature
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {feature}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>FAQ</CardTitle>
                <CardDescription>
                  Manage frequently asked questions and answers for your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FAQManager 
                  faqs={faqs} 
                  onFAQsChange={(newFAQs) => {
                    setFaqs(newFAQs);
                    form.setValue('faqs', newFAQs);
                  }} 
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end">
              <Button variant="outline" type="button" onClick={() => navigate("/")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Business Info"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default BusinessInfoPage;