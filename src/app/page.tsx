export default function Home() {
  return (
    <div className="space-y-12">
      {/* Sample blog posts to demonstrate the Seth Godin-inspired design */}
      
      {/* Post 1 */}
      <article>
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            The Power of Minimalism in Digital Design
          </h1>
          <div className="text-sm text-gray-500 flex items-center space-x-4">
            <time dateTime="2024-01-26">January 26, 2024</time>
            <span>•</span>
            <span>3 min read</span>
          </div>
        </header>
        
        <div className="prose-seth">
          <p>
            In a world cluttered with notifications, pop-ups, and endless distractions, 
            there's something profoundly powerful about embracing minimalism in digital design.
          </p>
          
          <p>
            This isn't about being sparse for the sake of it. It's about creating space 
            for what matters most: your ideas, your words, your connection with the reader.
          </p>
          
          <p>
            When you strip away the unnecessary, what remains is pure intention. 
            Every element serves a purpose. Every word carries weight. Every moment 
            of white space allows the reader to breathe, to think, to absorb.
          </p>
          
          <p>
            The best blogs don't compete for attention—they earn it through clarity, 
            consistency, and respect for the reader's time and intelligence.
          </p>
        </div>
      </article>

      {/* Post Divider */}
      <div className="post-divider"></div>

      {/* Post 2 */}
      <article>
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Why Full Content Matters
          </h1>
          <div className="text-sm text-gray-500 flex items-center space-x-4">
            <time dateTime="2024-01-25">January 25, 2024</time>
            <span>•</span>
            <span>2 min read</span>
          </div>
        </header>
        
        <div className="prose-seth">
          <p>
            "Read more" buttons are a relic of an era when page views mattered more than reader experience.
          </p>
          
          <p>
            When you force someone to click to continue reading, you're asking them to make 
            a commitment before they know if your content is worth their time. You're creating 
            friction where there should be flow.
          </p>
          
          <p>
            Instead, present your complete thoughts. Trust your reader to engage with ideas 
            that resonate and scroll past those that don't. Respect their ability to curate 
            their own experience.
          </p>
          
          <p>
            The goal isn't to maximize clicks—it's to maximize impact. And impact comes 
            from ideas that are fully formed, completely shared, and genuinely useful.
          </p>
        </div>
      </article>

      {/* Post Divider */}
      <div className="post-divider"></div>

      {/* Post 3 */}
      <article>
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Building for Speed and Substance
          </h1>
          <div className="text-sm text-gray-500 flex items-center space-x-4">
            <time dateTime="2024-01-24">January 24, 2024</time>
            <span>•</span>
            <span>4 min read</span>
          </div>
        </header>
        
        <div className="prose-seth">
          <p>
            Performance isn't just about technical metrics—it's about respect for your reader's time and attention.
          </p>
          
          <p>
            When your blog loads instantly, when navigation is intuitive, when the reading 
            experience is seamless, you're sending a message: "Your time is valuable, and 
            I've designed this experience with that in mind."
          </p>
          
          <p>
            Static site generation, thoughtful caching, optimized images—these aren't just 
            technical choices. They're editorial choices. They're statements about what you 
            value and how you want to serve your audience.
          </p>
          
          <p>
            The fastest websites aren't necessarily the most technically complex. Often, 
            they're the most thoughtfully simple. They load quickly because they only 
            include what's essential.
          </p>
          
          <p>
            Speed enables substance. When technical barriers disappear, ideas can flow freely 
            from writer to reader. That's the goal: frictionless transmission of meaningful ideas.
          </p>
        </div>
      </article>
    </div>
  );
}
