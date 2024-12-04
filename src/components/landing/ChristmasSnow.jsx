import React from 'react';

const Snowflake = (props) => {
    return (
        <p className="Snowflake" id={`item${props.id}`} style={props.style}>
            *
        </p>
    );
};

const ChristmasSnow = () => {
    const snow = () => {
        let animationDelay = '0s';
        const arr = Array.from(
            'Merry Christmas and a Happy New Year from Chatify! Enjoy the snow! Happy Holidays!'
        );
    
        return arr.map((el, i) => {
            animationDelay = `${(Math.random() * 16).toFixed(2)}s`;
            
            const minFontSize = 10;
            const maxFontSize = 30; 
            const fontSize = `${Math.floor(Math.random() * (maxFontSize - minFontSize + 1)) + minFontSize}px`; 
    
            const style = {
                animationDelay,
                fontSize, 
                left: `${Math.random() * 100}vw`,  
                position: 'absolute', //  
            };
            return <Snowflake key={i} id={i} style={style} />;
        });
    };

    return (
        <>
            <style>
                {`
        .ChristmasSnow {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 10;
        }

        .Snowflake {
          display: inline-block;
          color: #FFFAFA;
          opacity: 0;
          margin: 0;
          padding: 0;
          animation: fall 16s linear infinite;
        }

        @keyframes fall {
          0% {
            opacity: 0;
            transform: translateY(0); // Start from the top
          }
          5% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(100vh); // Fall to the bottom
            opacity: 0.5;
          }
        }
        `}
            </style>
            <div className="ChristmasSnow">{snow()}</div>
        </>
    );
};

export default ChristmasSnow;