"use client"

import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {useState, useRef, useEffect} from 'react';
import {initialAnalysis} from '@/ai/flows/initial-analysis-from-prompt';
import {useToast} from '@/hooks/use-toast';
import {Toaster} from "@/components/ui/toaster";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Loader2} from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
// import {
//   Chart,
//   ChartBar,
//   ChartBarSeries,
//   ChartContainer,
//   ChartLegend,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"

export default function Home() {
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('Analyze the cow for skin diseases.');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const {toast} = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [diseaseSpots, setDiseaseSpots] = useState<any[]>([]);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureImage = async () => {
    setIsCapturing(true);
    if (hasCameraPermission && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const capturedImage = canvas.toDataURL('image/jpeg');
      setImageUrl(capturedImage);
    }
    setTimeout(() => {
      setIsCapturing(false);
    }, 1500);
  };

  const handleAnalyzeImage = async () => {
    if (!imageUrl && !hasCameraPermission) {
      toast({
        title: 'Error',
        description: 'Please upload an image or enable camera access first.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setScanning(true);
    setTimeout(async () => {
      try {
        let imageToAnalyze = imageUrl;
        if (hasCameraPermission && videoRef.current && !imageUrl) {
          // Capture a frame from the live camera feed as a data URL
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          imageToAnalyze = canvas.toDataURL('image/jpeg'); // Convert to JPEG data URL
        }

        const result = await initialAnalysis({imageUrl: imageToAnalyze, prompt});
        setAnalysisResult(result);

        // Simulate identifying disease spots (replace with actual ML model output)
        // Remove the hardcoded disease spots
        // const simulatedDiseaseSpots = [
        //   { x: 30, y: 25, diseaseName: "Ringworm" , medicineName: "Miconazole Cream", medicineLink: "https://www.example.com/ringworm-treatment" },
        //   { x: 55, y: 60, diseaseName: "Lice Infestation" ,medicineName: "Permethrin Lotion",medicineLink: "https://www.example.com/lice-treatment" },
        //   { x: 70, y: 40, diseaseName: "Skin Lesion" ,medicineName: "Silver Sulfadiazine",medicineLink: "https://www.example.com/skin-lesion-treatment" },
        // ];
        // setDiseaseSpots(simulatedDiseaseSpots);
        setDiseaseSpots([]); // Initialize to empty array

        console.log(result);
      } catch (error: any) {
        toast({
          title: 'Analysis Failed',
          description: error.message || 'Failed to analyze the image. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
        setScanning(false);
      }
    }, 2000); // Simulate scanning for 2 seconds
  };

  // const chartData = [
  //   { name: 'Jan', uv: 400, pv: 240, amt: 240 },
  //   { name: 'Feb', uv: 300, pv: 139, amt: 221 },
  //   { name: 'Mar', uv: 200, pv: 980, amt: 229 },
  //   { name: 'Apr', uv: 278, pv: 390, amt: 200 },
  //   { name: 'May', uv: 189, pv: 480, amt: 218 },
  //   { name: 'Jun', uv: 239, pv: 380, amt: 250 },
  //   { name: 'Jul', uv: 349, pv: 430, amt: 210 },
  // ];

  // const chartConfig = {
  //   uv: {
  //     label: 'Health Score',
  //     color: 'hsl(var(--primary))',
  //   },
  //   pv: {
  //     label: 'Another Metric',
  //     color: 'hsl(var(--secondary))',
  //   },
  // };

  return (
    <div className="min-h-screen py-3 flex flex-col justify-center sm:py-6">
      <div className="relative py-1 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-green-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-2 py-5 bg-green-100 shadow-lg rounded-3xl sm:p-10">
          <Button asChild className="absolute top-2 right-2 shadow-professional text-sm">
            <a href="http://localhost:8080/n7/home.jsp">Go to Home</a>
          </Button>
          <h1 className="text-xl font-bold mb-4 text-gray-900 text-center shadow-professional">CowHealth AI 🐄</h1>
          <Card className="w-full rounded-professional shadow-professional">
            <CardHeader>
              <CardTitle className="text-lg drop-shadow-professional">Image Analysis 📸</CardTitle>
              <CardDescription className="text-sm">Upload an image of a cow or use live camera to analyze its health.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-1"
              />

              <div className="relative">
                <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
                {isCapturing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                    <Loader2 className="animate-spin text-white h-8 w-8" />
                  </div>
                )}
              </div>

              { !(hasCameraPermission) && (
                <Alert variant="destructive">
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access to use this feature.
                  </AlertDescription>
                </Alert>
              )}

              <Button onClick={handleCaptureImage} disabled={loading || isCapturing} className="shadow-professional mb-1 text-sm">
                {isCapturing ? 'Capturing...' : 'Capture Image'}
              </Button>

              {imageUrl && (
                <div className="relative w-full h-48 mb-2 rounded-md overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Uploaded Cow"
                    layout="fill"
                    objectFit="contain"
                    className={scanning ? 'animate-pulse' : ''} // Apply pulse animation during scanning
                  />
                  {scanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                      <Loader2 className="animate-spin text-white h-8 w-8" />
                    </div>
                  )}
                  {/* Disease Spots */}
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    {diseaseSpots.map((spot, index) => (
                      <div
                        key={index}
                        className="absolute flex items-center"
                        style={{
                          top: `${spot.y}%`,
                          left: `${spot.x}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div
                          className="rounded-full bg-red-500 bg-opacity-75"
                          style={{
                            width: '8px',
                            height: '8px',
                          }}
                        />
                        <span className="ml-1 text-white text-xs">{spot.diseaseName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Textarea
                placeholder="Enter analysis prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="shadow-professional text-sm"
              />
              <Button onClick={handleAnalyzeImage} disabled={loading} className="shadow-professional text-sm">
                {loading ? 'Analyzing...' : 'Analyze Image'}
              </Button>
            </CardContent>
          </Card>

          {analysisResult && (
            <div className="mt-4 space-y-2">

              {/* Health Graph */}
              {/*<Card className="w-full rounded-professional shadow-professional">
                <CardHeader>
                  <CardTitle className="text-lg drop-shadow-professional">Health Graph 📈</CardTitle>
                  <CardDescription className="text-sm">Visual representation of the cow's health over time.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[200px]">
                    <Chart data={chartData}>
                      <ChartBarSeries dataKey="uv" />
                      {/*<ChartBarSeries dataKey="pv" /> Example of another data series *}
                    </Chart>
                    <ChartLegend />
                    <ChartTooltip>
                      <ChartTooltipContent />
                    </ChartTooltip>
                  </ChartContainer>
                </CardContent>
              </Card>*/}

              <Card className="w-full rounded-professional shadow-professional">
                <CardHeader>
                  <CardTitle className="text-lg drop-shadow-professional">Analysis Result 🐄</CardTitle>
                  <CardDescription className="text-sm">Details of the cow analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.cowPresent ? (
                    <div className="flex flex-wrap gap-2">
                      <Card className="w-48">
                        <CardHeader>
                          <CardTitle className="text-sm">Breed</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">{analysisResult.breed}</CardContent>
                      </Card>
                      <Card className="w-48">
                        <CardHeader>
                          <CardTitle className="text-sm">Color</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">{analysisResult.color}</CardContent>
                      </Card>
                    </div>
                  ) : (
                    <p>No cow detected in the image.</p>
                  )}
                </CardContent>
              </Card>

              {analysisResult.cowPresent && analysisResult.diseaseDetails && analysisResult.diseaseDetails.length > 0 && (
                <Card className="w-full rounded-professional shadow-professional">
                    <CardHeader>
                      <CardTitle className="text-lg drop-shadow-professional">Suspected Conditions and Treatments 🛠️</CardTitle>
                      <CardDescription className="text-sm">Detailed information about the suspected conditions and possible treatments.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableCaption>A list of suspected conditions and their recommended treatments</TableCaption>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px] text-xs">Disease</TableHead>
                            <TableHead className="text-xs">Treatment</TableHead>
                            <TableHead className="text-xs">Link</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analysisResult.diseaseDetails.map((spot, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium text-xs">{spot.diseaseName}</TableCell>
                              <TableCell className="text-xs">{spot.medicineName}</TableCell>
                              <TableCell className="text-xs"><a href={spot.medicineLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                Treatment Information
                              </a></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
              )}

              {analysisResult.cowPresent && analysisResult.health !== "No visible disease signs" && (
                <div className="flex flex-col gap-2">
                  <Card className="w-full rounded-professional shadow-professional">
                    <CardHeader>
                      <CardTitle className="text-lg drop-shadow-professional">Suspected Conditions ⚠️</CardTitle>
                      <CardDescription className="text-sm">Detailed information about the suspected conditions.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <p>{analysisResult.health}</p>
                    </CardContent>
                  </Card>

                   {analysisResult.treatmentSuggestions && (
                    <Card className="w-full rounded-professional shadow-professional">
                      <CardHeader>
                        <CardTitle className="text-lg drop-shadow-professional">AI Treatment Suggestions 💡</CardTitle>
                        <CardDescription className="text-sm">AI-provided treatment suggestions for the suspected condition.</CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p>{analysisResult.treatmentSuggestions}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="w-full rounded-professional shadow-professional">
                    <CardHeader>
                      <CardTitle className="text-lg drop-shadow-professional">Precautions and Recommendations 📌</CardTitle>
                      <CardDescription className="text-sm">Steps to take for the cow's health.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <ul>
                        <li>Consult with a veterinarian for further diagnosis and treatment.</li>
                        <li>Ensure the cow is isolated from other healthy cows to prevent potential spread of any infectious conditions.</li>
                        <li>Maintain a clean and hygienic environment.</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
          <Toaster />
        </div>
      </div>
    </div>
  );
}
