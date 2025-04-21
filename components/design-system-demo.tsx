export function DesignSystemDemo() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="heading-1 mb-8">ReelTest Design System</h1>

      <section className="mb-12">
        <h2 className="heading-2 mb-4">Color Palette</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ColorCard name="Primary" color="bg-primary" textColor="text-primary-foreground" />
          <ColorCard name="Primary Hover" color="bg-primary-hover" textColor="text-primary-foreground" />
          <ColorCard name="Primary Active" color="bg-primary-active" textColor="text-primary-foreground" />
          <ColorCard name="Primary Light" color="bg-primary-light" textColor="text-primary" />

          <ColorCard name="Secondary" color="bg-secondary" textColor="text-secondary-foreground" />
          <ColorCard name="Secondary Hover" color="bg-secondary-hover" textColor="text-secondary-foreground" />
          <ColorCard name="Secondary Active" color="bg-secondary-active" textColor="text-secondary-foreground" />

          <ColorCard name="Success" color="bg-success" textColor="text-white" />
          <ColorCard name="Warning" color="bg-warning" textColor="text-white" />
          <ColorCard name="Destructive" color="bg-destructive" textColor="text-white" />
          <ColorCard name="Info" color="bg-info" textColor="text-white" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="heading-2 mb-4">Typography</h2>

        <div className="space-y-4">
          <div>
            <h1 className="heading-1">Heading 1</h1>
            <p className="text-text-secondary">3rem (48px), Bold, Line Height: Tight</p>
          </div>

          <div>
            <h2 className="heading-2">Heading 2</h2>
            <p className="text-text-secondary">2.25rem (36px), Bold, Line Height: Tight</p>
          </div>

          <div>
            <h3 className="heading-3">Heading 3</h3>
            <p className="text-text-secondary">1.5rem (24px), Semibold, Line Height: Tight</p>
          </div>

          <div>
            <h4 className="heading-4">Heading 4</h4>
            <p className="text-text-secondary">1.25rem (20px), Semibold, Line Height: Tight</p>
          </div>

          <div>
            <h5 className="heading-5">Heading 5</h5>
            <p className="text-text-secondary">1.125rem (18px), Semibold, Line Height: Tight</p>
          </div>

          <div>
            <p className="text-base">Body Text</p>
            <p className="text-text-secondary">1rem (16px), Normal, Line Height: Normal</p>
          </div>

          <div>
            <p className="text-sm">Small Text</p>
            <p className="text-text-secondary">0.875rem (14px), Normal, Line Height: Normal</p>
          </div>

          <div>
            <p className="text-xs">Caption Text</p>
            <p className="text-text-secondary">0.75rem (12px), Normal, Line Height: Normal</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="heading-2 mb-4">Buttons</h2>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <button className="btn btn-primary btn-md">Primary Button</button>
            <button className="btn btn-secondary btn-md">Secondary Button</button>
            <button className="btn btn-ghost btn-md">Ghost Button</button>
          </div>

          <div className="flex flex-wrap gap-4">
            <button className="btn btn-primary btn-sm">Small Button</button>
            <button className="btn btn-primary btn-md">Medium Button</button>
            <button className="btn btn-primary btn-lg">Large Button</button>
          </div>

          <div className="flex flex-wrap gap-4">
            <button disabled className="btn btn-primary btn-md">
              Disabled Button
            </button>
            <button disabled className="btn btn-secondary btn-md">
              Disabled Secondary
            </button>
            <button disabled className="btn btn-ghost btn-md">
              Disabled Ghost
            </button>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="heading-2 mb-4">Form Elements</h2>

        <div className="space-y-6 max-w-md">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input id="name" type="text" className="form-input" placeholder="Enter your name" />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input id="email" type="email" className="form-input" placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label htmlFor="message" className="form-label">
              Message
            </label>
            <textarea id="message" className="form-input min-h-[100px]" placeholder="Enter your message"></textarea>
          </div>

          <div className="form-group flex items-center gap-2">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="terms" className="text-sm text-text-primary">
              I agree to the terms and conditions
            </label>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="heading-2 mb-4">Cards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Card Title</h3>
              <p className="card-description">Card description goes here</p>
            </div>
            <div className="card-content">
              <p>This is the main content of the card. It can contain any elements.</p>
            </div>
            <div className="card-footer border-t pt-4">
              <button className="btn btn-primary btn-sm">Action</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Feature Card</h3>
              <p className="card-description">Highlight important features</p>
            </div>
            <div className="card-content">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Feature one description</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Feature two description</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Feature three description</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function ColorCard({ name, color, textColor }: { name: string; color: string; textColor: string }) {
  return (
    <div className="flex flex-col">
      <div className={`${color} h-20 rounded-md mb-2`}></div>
      <p className="font-medium">{name}</p>
      <p className="text-text-secondary text-sm">{color}</p>
    </div>
  )
}
