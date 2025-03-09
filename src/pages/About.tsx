
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Brain, History, Network, Sparkles } from 'lucide-react';

const About: React.FC = () => {
  return (
    <MainLayout>
      <div className="py-8 relative">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-galaxy-nova transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
        
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-galaxy-star via-cosmic-light to-galaxy-nova bg-clip-text text-transparent">About ChronoMind</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A powerful platform for visualizing historical data through interactive knowledge graphs, cosmic visualizations, and timelines.
          </p>
        </div>
        
        <Card className="cosmic-gradient mb-10 border-galaxy-nova/30 shadow-lg shadow-galaxy-core/10">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold">Our Mission</CardTitle>
            <CardDescription className="text-foreground/90">
              Making history interactive, accessible, and visually engaging
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>
              ChronoMind was created to transform how we understand and interact with historical knowledge. By leveraging cutting-edge visualization technologies and AI analysis, we bring historical connections and patterns to life in ways that traditional presentation cannot achieve.
            </p>
            <p>
              Our platform analyzes historical texts and dynamically generates interactive visualizations that reveal the interconnected nature of historical events, people, concepts, and places. These visualizations help researchers, educators, students, and history enthusiasts gain deeper insights and discover hidden relationships across time.
            </p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-muted/40 backdrop-blur-sm border-galaxy-nova/20 shadow-lg shadow-galaxy-core/10">
            <CardHeader>
              <div className="mb-2 bg-galaxy-core/20 w-12 h-12 rounded-full flex items-center justify-center">
                <Network className="h-6 w-6 text-galaxy-nova" />
              </div>
              <CardTitle className="text-xl">Knowledge Graphs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Explore interconnected historical entities through network visualizations showing direct relationships and influence patterns.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/40 backdrop-blur-sm border-galaxy-nova/20 shadow-lg shadow-galaxy-core/10">
            <CardHeader>
              <div className="mb-2 bg-galaxy-core/20 w-12 h-12 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-galaxy-nova" />
              </div>
              <CardTitle className="text-xl">Cosmic Visualizations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                View historical elements as celestial bodies in a cosmic arrangement, with size representing significance and proximity showing relations.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/40 backdrop-blur-sm border-galaxy-nova/20 shadow-lg shadow-galaxy-core/10">
            <CardHeader>
              <div className="mb-2 bg-galaxy-core/20 w-12 h-12 rounded-full flex items-center justify-center">
                <History className="h-6 w-6 text-galaxy-nova" />
              </div>
              <CardTitle className="text-xl">Interactive Timelines</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                See historical events, people, and concepts arranged chronologically to understand temporal relationships and periods.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Separator className="my-10" />
        
        <div className="mb-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-galaxy-star via-cosmic-light to-galaxy-nova bg-clip-text text-transparent">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Our platform leverages advanced technologies to transform text into rich visualizations
            </p>
          </div>
          
          <div className="relative pb-10">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-cosmic/80 to-transparent"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 relative">
              <div className="md:text-right md:pr-10">
                <div className="absolute hidden md:block right-1/2 top-4 w-4 h-4 rounded-full bg-cosmic transform translate-x-2 animate-pulse"></div>
                <h3 className="text-xl font-semibold">Text Analysis</h3>
                <p className="text-muted-foreground">
                  Our AI engine analyzes historical texts, identifying entities, relationships, time periods, and significance.
                </p>
              </div>
              <div className="md:pl-10"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 relative">
              <div className="md:pr-10"></div>
              <div className="md:pl-10">
                <div className="absolute hidden md:block left-1/2 top-4 w-4 h-4 rounded-full bg-cosmic transform -translate-x-2 animate-pulse"></div>
                <h3 className="text-xl font-semibold">Data Extraction</h3>
                <p className="text-muted-foreground">
                  Entities, events, places, and concepts are identified along with their relationships and temporal context.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 relative">
              <div className="md:text-right md:pr-10">
                <div className="absolute hidden md:block right-1/2 top-4 w-4 h-4 rounded-full bg-cosmic transform translate-x-2 animate-pulse"></div>
                <h3 className="text-xl font-semibold">Visualization Generation</h3>
                <p className="text-muted-foreground">
                  The extracted data is transformed into interactive knowledge graphs, cosmic visualizations, and timeline views.
                </p>
              </div>
              <div className="md:pl-10"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <div className="md:pr-10"></div>
              <div className="md:pl-10">
                <div className="absolute hidden md:block left-1/2 top-4 w-4 h-4 rounded-full bg-cosmic transform -translate-x-2 animate-pulse"></div>
                <h3 className="text-xl font-semibold">Interactive Experience</h3>
                <p className="text-muted-foreground">
                  Users can explore the visualizations through zooming, panning, fullscreen viewing, and exporting the results.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Card className="glass border-galaxy-nova/30 shadow-lg shadow-galaxy-core/10 text-center p-8">
          <CardContent className="pt-4">
            <Brain className="mx-auto h-16 w-16 text-cosmic mb-4" />
            <h2 className="text-2xl font-bold mb-4">Ready to Experience History in a New Way?</h2>
            <p className="mb-6 text-muted-foreground">
              Start visualizing historical connections with our interactive tools.
            </p>
            <Link 
              to="/visualize" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cosmic-button py-2 px-4 h-10"
            >
              Try the Visualizer
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default About;
