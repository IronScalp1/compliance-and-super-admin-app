import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  FileText, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  Star,
  Clock,
  Bell
} from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/Black and White.png" 
                alt="Fellow Carer" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold text-[#0A0A0A]">Fellow Carer</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-[#0A0A0A] transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-[#0A0A0A] transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-gray-600 hover:text-[#0A0A0A] transition-colors">
                About
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild className="text-black hover:text-gray-800 hover:bg-gray-50">
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-200">
            Trusted by 500+ care agencies
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-[#0A0A0A] mb-6 leading-tight">
            Simplify Care 
            <span className="text-primary"> Compliance</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Fellow Carer is the comprehensive platform that helps homecare agencies 
            track carers, manage documents, and maintain compliance with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/auth/signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 text-black border-black hover:bg-black hover:text-white">
              <Link to="/auth/login">
                Sign In
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              No setup fees
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A0A0A] mb-4">
              Everything you need for compliance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From document management to compliance tracking, Fellow Carer 
              provides all the tools you need to run your care agency efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-[#0A0A0A]">Carer Management</CardTitle>
                <CardDescription>
                  Comprehensive profiles for all your care workers with real-time status tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-[#0A0A0A]">Document Storage</CardTitle>
                <CardDescription>
                  Secure, organized document storage with automatic expiry tracking and reminders.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-[#0A0A0A]">Compliance Engine</CardTitle>
                <CardDescription>
                  Intelligent RAG system that automatically calculates and monitors compliance status.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-[#0A0A0A]">Smart Reporting</CardTitle>
                <CardDescription>
                  Generate professional compliance reports with Fellow Carer branding.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-[#0A0A0A]">Smart Alerts</CardTitle>
                <CardDescription>
                  Never miss an expiry date with automated email reminders and notifications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-[#0A0A0A]">Time Saving</CardTitle>
                <CardDescription>
                  Reduce admin time by up to 80% with automated processes and workflows.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A0A0A] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your care agency. All plans include core 
              compliance features and 24/7 support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-[#0A0A0A]">Starter Pack</CardTitle>
                <CardDescription>Perfect for small agencies</CardDescription>
                <div className="text-3xl font-bold text-[#0A0A0A] mt-4">
                  £29<span className="text-lg text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Up to 3 carers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Document storage
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Compliance tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Email reminders
                  </li>
                </ul>
                <Button className="w-full mt-6" asChild>
                  <Link to="/auth/signup">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-[#0A0A0A]">Team Pack</CardTitle>
                <CardDescription>Great for growing agencies</CardDescription>
                <div className="text-3xl font-bold text-[#0A0A0A] mt-4">
                  £79<span className="text-lg text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Up to 10 carers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Advanced reporting
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Custom templates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Priority support
                  </li>
                </ul>
                <Button className="w-full mt-6" asChild>
                  <Link to="/auth/signup">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-[#0A0A0A]">Business Pack</CardTitle>
                <CardDescription>For established agencies</CardDescription>
                <div className="text-3xl font-bold text-[#0A0A0A] mt-4">
                  £149<span className="text-lg text-gray-600">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Up to 20 carers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    API access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    White-label reports
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Phone support
                  </li>
                </ul>
                <Button className="w-full mt-6" asChild>
                  <Link to="/auth/signup">Start Free Trial</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors bg-slate-900 text-white">
              <CardHeader>
                <CardTitle className="text-white">Founder Partner</CardTitle>
                <CardDescription className="text-slate-300">Custom solutions</CardDescription>
                <div className="text-3xl font-bold text-white mt-4">
                  Custom
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Unlimited carers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Dedicated support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Custom integrations
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Training & onboarding
                  </li>
                </ul>
                <Button variant="secondary" className="w-full mt-6">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to transform your compliance?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of care agencies already using Fellow Carer to 
            streamline their compliance and focus on what matters most.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
            <Link to="/auth/signup">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/Black and White.png" 
                alt="Fellow Carer" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold">Fellow Carer</span>
            </div>
            <p className="text-slate-400">
              © 2025 Fellow Carer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}