import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  return (
    <div className="pt-32 pb-24 px-6 lg:px-8 max-w-4xl mx-auto text-[var(--color-brand-text-primary)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-black mb-6 text-gray-900 tracking-tight">Privacy Policy</h1>
        <div className="text-gray-500 font-medium mb-12">
          <p><strong>DAKH Edu Solutions | Learn. Build. Earn.</strong></p>
          <p>Website: <a href="https://www.dakhedusolutions.in/" className="text-purple-600 hover:underline">https://www.dakhedusolutions.in/</a></p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              DAKH Edu Solutions ("we", "us", "our") is a software development agency and student community platform. We build websites, mobile apps, and software solutions for businesses and institutions, while also running a large community of students through skill-building programs, training, and placement support.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              This Privacy Policy covers www.dakhedusolutions.in, our client-facing software/development services, our student community programs, and any mobile/web applications we build and operate — for ourselves or on behalf of our clients (together, the "Services"). By using our Services, you agree to the practices described here. If you do not agree, please do not use the Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Who This Policy Covers</h2>
            <p className="text-gray-600 leading-relaxed mb-4">This policy applies to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Visitors and users of www.dakhedusolutions.in</li>
              <li>Members of our student community (learners, trainees, job-seekers)</li>
              <li>Clients and businesses who engage us for software, app, or website development</li>
              <li>End users of apps/platforms we develop and operate for our clients</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Name, email address, phone number</li>
              <li>Educational/professional details (qualification, institution, resume/CV, skills) for community, training, and placement services</li>
              <li>Business details (company name, project requirements, contact person) for clients engaging our development services</li>
              <li>Account credentials (username, password)</li>
              <li>Payment and billing details for paid programs or services</li>
              <li>Project files, content, or data shared with us for development work</li>
              <li>Messages, feedback, or support queries</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Device information (device model, OS, browser type, unique identifiers)</li>
              <li>Log data (IP address, access times, pages/screens visited, app crashes)</li>
              <li>Usage data (course/community engagement, features used, session duration)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">3.3 Client Project Data</h3>
            <p className="text-gray-600 leading-relaxed">
              When we develop or manage software, apps, or websites for a client, we may process end-user data strictly as instructed by that client (e.g., their students, customers, or employees). In such cases, the client remains the data controller, and we act as a processor/developer under their direction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>To build, deliver, and maintain software/apps/websites for our clients</li>
              <li>To run our student community — courses, mentorship, events, and skill-building programs</li>
              <li>To provide placement and internship assistance</li>
              <li>To create and manage user accounts across our platforms</li>
              <li>To process payments for programs or development services</li>
              <li>To communicate updates, support responses, and (with consent) promotional content</li>
              <li>To improve our website, apps, and services</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Sharing of Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We do not sell personal information. We may share it with:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Placement/hiring partners, only with your consent, for job or internship opportunities</li>
              <li>Service providers (hosting, analytics, payment processors) bound by confidentiality obligations</li>
              <li>The client business/institution, where the app or platform you're using was built and is operated by us on their behalf</li>
              <li>Law enforcement or regulators, where required by law</li>
              <li>A successor entity in case of merger, acquisition, or restructuring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party Services</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Our website, community platform, and client apps may use:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Analytics</strong> (e.g., Google Analytics/Firebase) to understand usage</li>
              <li><strong>Payment gateways</strong> (e.g., Razorpay/Stripe) to process program/service payments</li>
              <li><strong>Cloud hosting</strong> (e.g., AWS/Google Cloud/Firebase) to store data securely</li>
              <li><strong>Communication tools</strong> (e.g., WhatsApp Business API, email services) for support and updates</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">These providers may collect data under their own privacy policies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Where our community or client apps are used by students under 18, we collect their information only with appropriate consent from a parent, guardian, or the enrolling institution, and only as necessary for educational or community purposes. Parents/guardians may contact us to review, correct, or request deletion of their child's data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We use reasonable technical and organizational safeguards (encryption in transit, access controls, restricted internal access) to protect your information, including client project data. No system is 100% secure, so we cannot guarantee absolute protection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain personal data only as long as necessary to provide our Services or fulfil a client project, or as required by law, after which it is deleted or anonymized.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">You may:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Access, correct, or update your information</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for marketing communications</li>
              <li>Request details on how your data is used</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">To exercise these rights, contact us using the details in Section 13.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Cookies (Website)</h2>
            <p className="text-gray-600 leading-relaxed">
              Our website uses cookies to remember preferences, keep you logged in, and understand site traffic. You can disable cookies in your browser settings, though this may affect site functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. App Permissions (For Play Store Apps)</h2>
            <p className="text-gray-600 leading-relaxed">
              Where DAKH Edu Solutions publishes apps on Google Play — for ourselves or for clients — we request only the permissions necessary for core functionality (e.g., storage for uploading documents, camera for photo/document scanning). Users may withdraw permissions anytime via device settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">DAKH Edu Solutions</h3>
              <ul className="space-y-3 text-gray-600">
                <li><strong>Website:</strong> <a href="https://www.dakhedusolutions.in/" className="text-purple-600 hover:underline">https://www.dakhedusolutions.in/</a></li>
                <li><strong>Email:</strong> <a href="mailto:info@dakhedusolutions.in" className="text-purple-600 hover:underline">info@dakhedusolutions.in</a></li>
                <li><strong>Phone:</strong> <a href="tel:+918778317180" className="text-purple-600 hover:underline">+91 877 831 7180</a></li>
                <li><strong>Address:</strong> Chennai, Tamil Nadu, India</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy periodically. Material changes will be posted on our website with an updated "Last Updated" date. Continued use of our Services after changes means you accept the revised policy.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
