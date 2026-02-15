import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NewsTicker = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/news');
        setNews(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="bg-gov-blue text-white py-1.5 overflow-hidden relative border-y border-white/10 h-10 flex items-center">
      <div className="absolute left-0 top-0 bottom-0 bg-gov-orange px-3 z-10 flex items-center font-bold text-xs shadow-lg uppercase tracking-wider">
        Latest News
      </div>
      <div className="whitespace-nowrap animate-marquee flex gap-10 items-center">
        {news.length > 0 ? (
          // Duplicate news to ensure continuous scroll if content is short
          [...news, ...news].map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              <span className="text-gov-orange">📢</span> {item.content}
            </span>
          ))
        ) : (
          <>
            <span>📢 General Elections 2026 dates announced! Voting starts April 1st.</span>
            <span>📢 Candidate Registration closes on March 15th. Apply now!</span>
            <span>📢 Check your Voter ID status in the dashboard.</span>
            {/* Repeat for continuous feel */}
            <span>📢 General Elections 2026 dates announced! Voting starts April 1st.</span>
            <span>📢 Candidate Registration closes on March 15th. Apply now!</span>
          </>
        )}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 40s linear infinite;
          min-width: 200%;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;
