
import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Brain, Clock, Database, GitBranch, Globe, Workflow } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <MainLayout>
      {/* Hero section */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="cosmic-text mb-6">About ChronoMind</h1>
          <p className="text-lg text-muted-foreground">
            ChronoMind is an innovative platform that transforms historical text into interactive visualizations, 
            revealing connections and relationships across time and space.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl font-medium">Our Mission</h2>
            <p className="text-muted-foreground">
              Our mission is to make historical knowledge more accessible and engaging through
              interactive visualizations. We believe that by visualizing the complex relationships
              between historical events, people, and concepts, we can deepen our understanding
              of history and its impact on our present and future.
            </p>
            <p className="text-muted-foreground">
              ChronoMind uses advanced AI to analyze historical texts and generate 
              multi-dimensional visualizations that reveal connections not immediately apparent
              in traditional linear narratives.
            </p>
            <div className="pt-4">
              <Link to="/visualize">
                <Button>
                  Try Visualizer <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative">
            <div className="glass rounded-xl p-8 relative z-10">
              <div className="aspect-video rounded-lg overflow-hidden cosmic-gradient flex items-center justify-center">
                <div className="text-white text-6xl">🌌</div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Visualizing the cosmos of human history
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-cosmic/5 rounded-xl blur-3xl -z-10 transform translate-x-4 translate-y-4"></div>
          </div>
        </div>
      </section>
      
      <Separator className="my-8" />
      
      {/* How it works section */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-medium mb-4">How ChronoMind Works</h2>
          <p className="text-muted-foreground">
            Our platform uses advanced AI to transform historical text into interactive visualizations
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-6 rounded-lg">
            <div className="h-12 w-12 rounded-full cosmic-gradient flex items-center justify-center mb-4">
              <Book className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2">Text Analysis</h3>
            <p className="text-sm text-muted-foreground">
              We analyze historical texts to identify entities, events, concepts, and their relationships.
            </p>
          </div>
          
          <div className="glass p-6 rounded-lg">
            <div className="h-12 w-12 rounded-full cosmic-gradient flex items-center justify-center mb-4">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2">AI Processing</h3>
            <p className="text-sm text-muted-foreground">
              Our AI extracts meaning and context, establishing connections between historical elements.
            </p>
          </div>
          
          <div className="glass p-6 rounded-lg">
            <div className="h-12 w-12 rounded-full cosmic-gradient flex items-center justify-center mb-4">
              <Workflow className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2">Relationship Mapping</h3>
            <p className="text-sm text-muted-foreground">
              We map complex relationships between people, events, places, and concepts across time.
            </p>
          </div>
          
          <div className="glass p-6 rounded-lg">
            <div className="h-12 w-12 rounded-full cosmic-gradient flex items-center justify-center mb-4">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-2">Visualization</h3>
            <p className="text-sm text-muted-foreground">
              Multiple interactive visualization types provide different perspectives on historical data.
            </p>
          </div>
        </div>
      </section>
      
      <Separator className="my-8" />
      
      {/* Technology section */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-medium mb-4">Our Technology</h2>
          <p className="text-muted-foreground">
            ChronoMind leverages cutting-edge technologies to deliver powerful visualizations
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
              <Brain className="h-6 w-6 text-cosmic" />
            </div>
            <h3 className="text-xl font-medium">AI & NLP</h3>
            <p className="text-muted-foreground">
              Advanced natural language processing extracts meaningful relationships from historical texts.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
              <Database className="h-6 w-6 text-cosmic" />
            </div>
            <h3 className="text-xl font-medium">Knowledge Graph</h3>
            <p className="text-muted-foreground">
              Our knowledge graph technology maps complex relationships between historical entities.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
              <Clock className="h-6 w-6 text-cosmic" />
            </div>
            <h3 className="text-xl font-medium">Temporal Analysis</h3>
            <p className="text-muted-foreground">
              Sophisticated temporal analysis algorithms reveal patterns across different time periods.
            </p>
          </div>
        </div>
      </section>
      
      <Separator className="my-8" />
      
      {/* CTA section */}
      <section className="container py-16">
        <div className="glass cosmic-gradient text-white rounded-lg p-8 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-medium mb-4">Start Exploring History Today</h2>
            <p className="text-white/80 mb-8">
              Transform your understanding of historical texts with ChronoMind's interactive visualizations.
            </p>
            <Link to="/visualize">
              <Button variant="outline" className="bg-white/10 text-white hover:bg-white/20 border-white/20">
                Try the Visualizer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default About;
