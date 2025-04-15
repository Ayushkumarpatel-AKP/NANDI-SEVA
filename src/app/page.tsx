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
        const simulatedDiseaseSpots = [
          { x: 30, y: 25, diseaseName: "Ringworm" , medicineLink: "https://www.example.com/ringworm-treatment" },
          { x: 55, y: 60, diseaseName: "Lice Infestation" ,medicineLink: "https://www.example.com/lice-treatment" },
          { x: 70, y: 40, diseaseName: "Skin Lesion" ,medicineLink: "https://www.example.com/skin-lesion-treatment" },
        ];
        setDiseaseSpots(simulatedDiseaseSpots);

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

  return (
    <div className="min-h-screen py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-green-300 to-green-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-green-100 shadow-lg rounded-3xl sm:p-20">
          <h1 className="text-2xl font-bold mb-8 text-gray-900 text-center shadow-professional">CowHealth AI</h1>
          <Card className="w-full rounded-professional shadow-professional">
            <CardHeader>
              <CardTitle className="drop-shadow-professional">Image Analysis</CardTitle>
              <CardDescription>Upload an image of a cow or use live camera to analyze its health.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2"
              />

              <div className="relative">
                <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
                {isCapturing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                    <Loader2 className="animate-spin text-white h-12 w-12" />
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

              <Button onClick={handleCaptureImage} disabled={loading || isCapturing} className="shadow-professional mb-2">
                {isCapturing ? 'Capturing...' : 'Capture Image'}
              </Button>

              {imageUrl && (
                <div className="relative w-full h-64 mb-4 rounded-md overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Uploaded Cow"
                    layout="fill"
                    objectFit="contain"
                    className={scanning ? 'animate-pulse' : ''} // Apply pulse animation during scanning
                  />
                  {scanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                      <Loader2 className="animate-spin text-white h-12 w-12" />
                    </div>
                  )}
                  {diseaseSpots.map((spot, index) => (
                    <div
                      key={index}
                      className="absolute rounded-full bg-red-500 bg-opacity-75"
                      style={{
                        top: `${spot.y}%`,
                        left: `${spot.x}%`,
                        width: '10px',
                        height: '10px',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <span className="absolute top-full left-1/2 transform -translate-x-1/2 text-white text-xs">{spot.diseaseName}</span>
                      <a href={spot.medicineLink} target="_blank" rel="noopener noreferrer" className="absolute bottom-full left-1/2 transform -translate-x-1/2 text-white text-xs bg-blue-500 p-1 rounded-md">
                        Treatment
                      </a>
                    </div>
                  ))}
                </div>
              )}
              <Textarea
                placeholder="Enter analysis prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="shadow-professional"
              />
              <Button onClick={handleAnalyzeImage} disabled={loading} className="shadow-professional">
                {loading ? 'Analyzing...' : 'Analyze Image'}
              </Button>
            </CardContent>
          </Card>

          {analysisResult && (
            <div className="mt-8 space-y-4">
              <Card className="w-full rounded-professional shadow-professional">
                <CardHeader>
                  <CardTitle className="drop-shadow-professional">Analysis Result</CardTitle>
                  <CardDescription>Details of the cow analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult.cowPresent ? (
                    <div className="flex flex-wrap gap-4">
                      <Card className="w-64">
                        <CardHeader>
                          <CardTitle>Breed</CardTitle>
                        </CardHeader>
                        <CardContent>{analysisResult.breed}</CardContent>
                      </Card>
                      <Card className="w-64">
                        <CardHeader>
                          <CardTitle>Color</CardTitle>
                        </CardHeader>
                        <CardContent>{analysisResult.color}</CardContent>
                      </Card>
                    </div>
                  ) : (
                    <p>No cow detected in the image.</p>
                  )}
                </CardContent>
              </Card>

              {analysisResult.cowPresent && analysisResult.health !== "No visible disease signs" && (
                <div className="flex flex-col gap-4">
                  <Card className="w-full rounded-professional shadow-professional">
                    <CardHeader>
                      <CardTitle className="drop-shadow-professional">Suspected Conditions</CardTitle>
                      <CardDescription>Detailed information about the suspected conditions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{analysisResult.health}</p>
                    </CardContent>
                  </Card>

                  <Card className="w-full rounded-professional shadow-professional">
                    <CardHeader>
                      <CardTitle className="drop-shadow-professional">Precautions and Recommendations</CardTitle>
                      <CardDescription>Steps to take for the cow's health.</CardDescription>
                    </CardHeader>
                    <CardContent>
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
