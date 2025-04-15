"use client"

import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {useState} from 'react';
import {initialAnalysis} from '@/ai/flows/initial-analysis-from-prompt';
import {useToast} from '@/hooks/use-toast';
import {Toaster} from "@/components/ui/toaster";

export default function Home() {
  const [imageUrl, setImageUrl] = useState('');
  const [prompt, setPrompt] = useState('Analyze the cow for skin diseases.');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

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

  const handleAnalyzeImage = async () => {
    if (!imageUrl) {
      toast({
        title: 'Error',
        description: 'Please upload an image first.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await initialAnalysis({imageUrl, prompt});
      setAnalysisResult(result);
      console.log(result);
    } catch (error: any) {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cowhealth-secondary py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cowhealth-secondary to-cowhealth-accent shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-cowhealth-primary shadow-lg rounded-3xl sm:p-20">
          <h1 className="text-2xl font-bold mb-8 text-cowhealth-text text-center">CowHealth AI</h1>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Image Analysis</CardTitle>
              <CardDescription>Upload an image of a cow to analyze its health.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2"
              />
              {imageUrl && (
                <div className="relative w-full h-64 mb-4 rounded-md overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt="Uploaded Cow"
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              )}
              <Textarea
                placeholder="Enter analysis prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button onClick={handleAnalyzeImage} disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze Image'}
              </Button>
            </CardContent>
          </Card>

          {analysisResult && (
            <Card className="w-full mt-8">
              <CardHeader>
                <CardTitle>Analysis Result</CardTitle>
                <CardDescription>Details of the cow analysis.</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap">{JSON.stringify(analysisResult, null, 2)}</pre>
              </CardContent>
            </Card>
          )}
          <Toaster />
        </div>
      </div>
    </div>
  );
}
