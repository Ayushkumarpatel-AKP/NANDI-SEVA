"use client"

import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {useState} from 'react';
import {initialAnalysis} from '@/ai/flows/initial-analysis-from-prompt';
import {useToast} from '@/hooks/use-toast';

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
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4 text-cowhealth-text">CowHealth AI</h1>
      <Card className="w-full max-w-md">
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
            <div className="relative w-full h-64 mb-4">
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
        <Card className="w-full max-w-md mt-8">
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>Details of the cow analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
