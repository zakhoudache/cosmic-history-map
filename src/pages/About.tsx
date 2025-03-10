
import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Brain, History, Network, Sparkles } from 'lucide-react';

const About: React.FC = () => {
  return (
    <MainLayout>
      {/* Cosmic Background Effects */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(91,33,182,0.15),rgba(0,0,0,0)_70%)]"></div>
      <div className="fixed inset-0 -z-10 bg-background"></div>
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIxIiBjeT0iMSIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9nPjwvc3ZnPg==')] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-galaxy-nova hover:text-galaxy-blue-giant transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
        
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent">About ChronoMind</h1>
          <p className="mt-4 text-lg text-foreground/70 max-w-2xl mx-auto">
            A powerful platform for visualizing historical data through interactive knowledge graphs, cosmic visualizations, and timelines.
          </p>
        </div>
        
        <Card className="backdrop-blur-lg bg-black/30 border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10 overflow-hidden mb-10 relative">
          {/* Glowing Orb Top Right */}
          <div className="absolute top-0 right-0 -m-10 w-40 h-40 bg-galaxy-nova/20 rounded-full blur-2xl pointer-events-none"></div>
          {/* Glowing Orb Bottom Left */}
          <div className="absolute bottom-0 left-0 -m-10 w-40 h-40 bg-galaxy-blue-giant/20 rounded-full blur-2xl pointer-events-none"></div>
          
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-galaxy-star via-cosmic-light to-galaxy-nova bg-clip-text text-transparent">Our Mission</CardTitle>
            <CardDescription className="text-foreground/90">
              Making history interactive, accessible, and visually engaging
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p className="text-foreground/80">
              ChronoMind was created to transform how we understand and interact with historical knowledge. By leveraging cutting-edge visualization technologies and AI analysis, we bring historical connections and patterns to life in ways that traditional presentation cannot achieve.
            </p>
            <p className="text-foreground/80">
              Our platform analyzes historical texts and dynamically generates interactive visualizations that reveal the interconnected nature of historical events, people, concepts, and places. These visualizations help researchers, educators, students, and history enthusiasts gain deeper insights and discover hidden relationships across time.
            </p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="backdrop-blur-lg bg-black/20 border border-galaxy-nova/20 shadow-lg shadow-galaxy-core/10 transition-transform duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="mb-2 bg-gradient-to-r from-galaxy-nova/30 to-galaxy-blue-giant/30 w-12 h-12 rounded-full flex items-center justify-center">
                <Network className="h-6 w-6 text-galaxy-nova" />
              </div>
              <CardTitle className="text-xl bg-gradient-to-r from-galaxy-star to-galaxy-nova bg-clip-text text-transparent">Knowledge Graphs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">
                Explore interconnected historical entities through network visualizations showing direct relationships and influence patterns.
              </p>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-lg bg-black/20 border border-galaxy-nova/20 shadow-lg shadow-galaxy-core/10 transition-transform duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="mb-2 bg-gradient-to-r from-galaxy-nova/30 to-galaxy-blue-giant/30 w-12 h-12 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-galaxy-nova" />
              </div>
              <CardTitle className="text-xl bg-gradient-to-r from-galaxy-star to-galaxy-nova bg-clip-text text-transparent">Cosmic Visualizations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">
                View historical elements as celestial bodies in a cosmic arrangement, with size representing significance and proximity showing relations.
              </p>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-lg bg-black/20 border border-galaxy-nova/20 shadow-lg shadow-galaxy-core/10 transition-transform duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="mb-2 bg-gradient-to-r from-galaxy-nova/30 to-galaxy-blue-giant/30 w-12 h-12 rounded-full flex items-center justify-center">
                <History className="h-6 w-6 text-galaxy-nova" />
              </div>
              <CardTitle className="text-xl bg-gradient-to-r from-galaxy-star to-galaxy-nova bg-clip-text text-transparent">Interactive Timelines</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">
                See historical events, people, and concepts arranged chronologically to understand temporal relationships and periods.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Separator className="my-10 bg-galaxy-nova/20" />
        
        <div className="mb-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-galaxy-star via-cosmic-light to-galaxy-nova bg-clip-text text-transparent">How It Works</h2>
            <p className="mt-2 text-foreground/70">
              Our platform leverages advanced technologies to transform text into rich visualizations
            </p>
          </div>
          
          <div className="relative pb-10">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-galaxy-nova/80 to-transparent"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 relative">
              <div className="md:text-right md:pr-10">
                <div className="absolute hidden md:block right-1/2 top-4 w-4 h-4 rounded-full bg-galaxy-nova transform translate-x-2 animate-pulse-subtle"></div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-galaxy-star to-galaxy-nova bg-clip-text text-transparent">Text Analysis</h3>
                <p className="text-foreground/70">
                  Our AI engine analyzes historical texts, identifying entities, relationships, time periods, and significance.
                </p>
              </div>
              <div className="md:pl-10"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 relative">
              <div className="md:pr-10"></div>
              <div className="md:pl-10">
                <div className="absolute hidden md:block left-1/2 top-4 w-4 h-4 rounded-full bg-galaxy-nova transform -translate-x-2 animate-pulse-subtle"></div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-galaxy-star to-galaxy-nova bg-clip-text text-transparent">Data Extraction</h3>
                <p className="text-foreground/70">
                  Entities, events, places, and concepts are identified along with their relationships and temporal context.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 relative">
              <div className="md:text-right md:pr-10">
                <div className="absolute hidden md:block right-1/2 top-4 w-4 h-4 rounded-full bg-galaxy-nova transform translate-x-2 animate-pulse-subtle"></div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-galaxy-star to-galaxy-nova bg-clip-text text-transparent">Visualization Generation</h3>
                <p className="text-foreground/70">
                  The extracted data is transformed into interactive knowledge graphs, cosmic visualizations, and timeline views.
                </p>
              </div>
              <div className="md:pl-10"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <div className="md:pr-10"></div>
              <div className="md:pl-10">
                <div className="absolute hidden md:block left-1/2 top-4 w-4 h-4 rounded-full bg-galaxy-nova transform -translate-x-2 animate-pulse-subtle"></div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-galaxy-star to-galaxy-nova bg-clip-text text-transparent">Interactive Experience</h3>
                <p className="text-foreground/70">
                  Users can explore the visualizations through zooming, panning, fullscreen viewing, and exporting the results.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Card className="backdrop-blur-lg bg-black/30 border border-galaxy-nova/30 shadow-xl shadow-galaxy-nova/10 overflow-hidden text-center p-8 relative">
          {/* Glowing Orb Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-galaxy-nova/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <CardContent className="pt-4 relative z-10">
            <Brain className="mx-auto h-16 w-16 text-galaxy-nova mb-4" />
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-galaxy-star to-galaxy-nova bg-clip-text text-transparent">Ready to Experience History in a New Way?</h2>
            <p className="mb-6 text-foreground/70">
              Start visualizing historical connections with our interactive tools.
            </p>
            <Link 
              to="/visualize" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-galaxy-nova to-galaxy-blue-giant hover:from-galaxy-blue-giant hover:to-galaxy-nova text-white px-8 py-3 rounded-md shadow-lg shadow-galaxy-nova/20 hover:shadow-xl hover:shadow-galaxy-nova/30 hover:-translate-y-1 duration-300"
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
