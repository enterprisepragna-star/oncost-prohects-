'use client';

import Link from 'next/link';
import { Briefcase, Users, Target } from 'lucide-react';

const jobs = [
  { title: 'Sales Executive', dept: 'Sales', location: 'Bangalore' },
  { title: 'Product Manager', dept: 'Product', location: 'Delhi' },
  { title: 'Marketing Specialist', dept: 'Marketing', location: 'Mumbai' },
  { title: 'Backend Developer', dept: 'Tech', location: 'Bangalore' },
];

export default function CareersPage() {
  return (
    <main>
      <div className="topbar">
        <span>💼 Join Our Team</span>
        <span>🚀 Growing Company</span>
        <span>🌟 Great Culture</span>
      </div>

      <header className="site-header">
        <Link className="logo" href="/">ONCOST</Link>
        <nav className="desktop-nav">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/careers">Careers</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <section className="page-hero">
        <div>
          <p className="eyebrow">We're Hiring</p>
          <h1>Join the ONCOST Team</h1>
          <p>Be part of a fast-growing premium gifting platform transforming India's celebrations</p>
        </div>
      </section>

      <section className="section">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '32px', textAlign: 'center' }}>Why Work with Us?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f7f4', borderRadius: '8px' }}>
              <Users size={32} style={{ color: '#8B2E3B', margin: '0 auto 12px' }} />
              <h3 style={{ marginBottom: '8px' }}>Great Team</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>Work with talented, passionate professionals</p>
            </div>
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f7f4', borderRadius: '8px' }}>
              <Target size={32} style={{ color: '#8B2E3B', margin: '0 auto 12px' }} />
              <h3 style={{ marginBottom: '8px' }}>Growth</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>Rapid growth and learning opportunities</p>
            </div>
            <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f9f7f4', borderRadius: '8px' }}>
              <Briefcase size={32} style={{ color: '#8B2E3B', margin: '0 auto 12px' }} />
              <h3 style={{ marginBottom: '8px' }}>Flexibility</h3>
              <p style={{ fontSize: '14px', color: '#666' }}>Flexible work arrangements and support</p>
            </div>
          </div>

          <h2 style={{ marginBottom: '24px' }}>Open Positions</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {jobs.map((job, i) => (
              <div key={i} style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{job.title}</h3>
                  <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>{job.dept} • {job.location}</p>
                </div>
                <Link href="/contact" className="button secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>Apply</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ backgroundColor: '#f9f7f4' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px' }}>Don't see your role?</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>Send us your profile - we're always interested in great talent!</p>
          <Link href="/contact" className="button primary">Send Your Resume</Link>
        </div>
      </section>

      <footer className="site-footer">
        <h2>ONCOST</h2>
        <p>Premium gifting collections for every occasion</p>
        <nav>
          <Link href="/about">About</Link>
          <Link href="/careers">Careers</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </footer>
    </main>
  );
}