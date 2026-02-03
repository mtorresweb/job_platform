import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CookiesPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-muted-foreground text-lg">
          Last updated: June 8, 2025
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. What Are Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
              They are widely used to make websites work more efficiently and provide information to website owners.
            </p>
            <p>
              We use cookies to enhance your experience on our platform, remember your preferences, and analyze how 
              our service is used to improve functionality.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Types of Cookies We Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Essential Cookies</h4>
              <p>
                These cookies are necessary for the website to function properly. They enable core functionality 
                such as security, network management, and accessibility. Without these cookies, our services 
                cannot be provided.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Performance Cookies</h4>
              <p>
                These cookies collect information about how you use our website, such as which pages you visit 
                most often. This data helps us improve how our website works and optimize user experience.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Functionality Cookies</h4>
              <p>
                These cookies remember choices you make to improve your experience. They may remember your 
                username, language preference, or region you are in.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Authentication Cookies</h4>
              <p>
                These cookies keep you logged in and maintain your session security while using our platform.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Third-Party Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may use third-party services that place cookies on your device. These include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Analytics services to understand how users interact with our platform</li>
              <li>Authentication providers for secure login functionality</li>
              <li>Content delivery networks to improve site performance</li>
            </ul>
            <p>
              These third-party services have their own privacy policies and cookie practices, which we encourage 
              you to review.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Managing Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              You can control and manage cookies in various ways:
            </p>
            <div>
              <h4 className="font-semibold mb-2">Browser Settings</h4>
              <p>                Most web browsers allow you to control cookies through their settings. You can usually find 
                these settings in the &quot;Options&quot; or &quot;Preferences&quot; menu of your browser.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Disabling Cookies</h4>
              <p>
                You can choose to disable cookies, but please note that this may affect the functionality 
                of our website and limit your user experience.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Cookie Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cookies are retained for different periods depending on their purpose:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until manually deleted</li>
              <li><strong>Authentication Cookies:</strong> Typically expire after 30 days of inactivity</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Your Consent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              By using our website, you consent to the use of cookies as described in this policy. 
              If you do not agree to our use of cookies, you should disable them through your browser 
              settings or discontinue use of our website.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Updates to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices 
              or for other operational, legal, or regulatory reasons. We will notify you of any material 
              changes by posting the updated policy on our website.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have any questions about our use of cookies or this Cookie Policy, please contact us at:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p><strong>Email:</strong> privacy@jobplatform.com</p>
              <p><strong>Address:</strong> 123 Platform Street, Tech City, TC 12345</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
