import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Search, Download, Upload, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 bg-accent/10 text-accent border-accent/20">
            Professional Lead Management
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Streamline Your <span className="text-primary">Buyer Lead</span> Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
            Capture, organize, and manage buyer leads with powerful validation, search capabilities, and seamless CSV
            import/export functionality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 cursor-pointer">
                Start Managing Leads
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Everything You Need to Manage Leads</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for real estate professionals and sales teams who need reliable, efficient lead management tools.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Smart Lead Capture</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Intelligent forms with built-in validation to ensure data quality and completeness.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-foreground">Advanced Search & Filter</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Quickly find leads with powerful search and filtering capabilities across all fields.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-foreground">CSV Import/Export</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Seamlessly import existing leads and export data for analysis or backup.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Lead Organization</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Organize leads by status, priority, source, and custom categories for better management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-foreground">Data Export</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Export filtered lead lists to CSV for use in other tools or reporting systems.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-foreground">Data Security</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your lead data is secure with industry-standard encryption and privacy protection.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">LeadIntake</span>
          </div>
          <p className="text-muted-foreground">© 2024 LeadIntake. Professional buyer lead management made simple.</p>
        </div>
      </footer>
    </div>
  )
}
