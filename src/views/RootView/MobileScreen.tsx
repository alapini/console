import * as React from 'react'
/* tslint:disable */

interface Props {}

export default function MobileScreen({  }: Props) {
  return (
    <div className="mobile-loading-content">
      <style jsx={true}>{`
        .mobile-loading-content {
          font-family: 'Open Sans', sans-serif;
          width: 100vw;
          height: 100vh;
          padding: 38px;
          box-sizing: border-box;
          background: radial-gradient(circle at 49% 49%, #172a3a, #0f202d);
        }
        .logos {
          width: 100%;
          display: flex;
          justify-content: space-between;
        }
        .mobile-loading-content h1 {
          font-size: 30px;
          color: white;
          font-weight: 600;
          margin-top: 60px;
          max-width: 520px;
        }
        .mobile-loading-content p {
          margin-top: 25px;
          margin-bottom: 25px;
          opacity: 0.7;
          font-size: 16px;
          text-align: left;
          color: #ffffff;
          font-weight: 400;
          max-width: 520px;
        }
        .btn {
          border-radius: 2px;
          text-transform: uppercase;
          font-size: 14px;
          padding: 12px 16px;
          letter-spacing: 0.5px;
          color: #172a3a;
          background: white;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.15);
          margin-top: 16px;
          display: inline-block;
          text-decoration: none;
        }
        .btn.green {
          background: #27ae60;
          color: white;
        }
        .btn:first-of-type {
          margin-right: 25px;
        }
        @media (max-width: 520px) {
          div.sad {
            position: absolute;
            top: 38px;
            right: 38px;
          }
          div.sad svg {
            width: 48.88px;
            height: 38.87px;
          }
        }
        @media (min-width: 521px) {
          .sad {
            margin-top: 60px;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .sad svg {
            width: 84.8px;
            height: 68.2px;
          }
          .mobile-loading-content h1 {
            font-size: 32px;
            text-align: center;
          }
          .mobile-loading-content {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .mobile-loading-content p {
            text-align: center;
            font-size: 20px;
          }
        }
      `}</style>

      <div className="logos">
        <svg width="50px" height="50px" viewBox="0 0 50 50">
          <path
            d={`M38.87,18.81c-1.77-1-4,0.3-4.35,0.53l-7.65,4.35c-1.29-1.03-3.17-0.81-4.19,0.48
                c-1.03,1.29-0.81,3.18,0.48,4.2c1.29,1.03,3.17,0.81,4.19-0.48c0.53-0.67,0.75-1.54,0.6-2.38l7.63-4.34l0.05-0.03
                c0.5-0.32,1.66-0.79,2.21-0.48c0.39,0.22,0.62,0.96,0.63,2.05h-0.01v9.59c0,0.89-0.48,1.72-1.25,2.17L26.25,40.8
                c-0.77,0.45-1.72,0.45-2.5,0l-10.96-6.35c-0.77-0.45-1.25-1.27-1.25-2.17V19.6c0-0.89,0.48-1.72,1.25-2.17l9.92-5.74
                c1.08,1.24,2.97,1.37,4.21,0.29c1.24-1.08,1.37-2.97,0.29-4.22C26.12,6.53,24.24,6.4,23,7.48c-0.64,0.55-1.01,1.35-1.02,2.2
                L11.74,15.6c-1.43,0.83-2.31,2.35-2.31,4v12.68c0,1.65,0.88,3.18,2.3,4l10.96,6.35c1.43,0.82,3.18,0.82,4.61,0l10.96-6.35
                c1.42-0.83,2.3-2.35,2.3-4v-9.22h0.01C40.63,20.91,40.05,19.47,38.87,18.81`}
            fill="#27ae60"
          />
        </svg>
      </div>
      <div className="sad">
        <svg x="0px" y="0px" viewBox="0 0 48.88 38.87">
          <style type="text/css">
            {`
          .st0 {
            opacity: 0.5;
            fill: #FFFFFF;
          }

            .st1 {
            fill: #FFFFFF;
          }
          `}
          </style>
          <g id="XMLID_15_">
            <path
              id="XMLID_23_"
              className="st0"
              d={`M43.8,0H5.08C2.28,0,0,2.29,0,5.1v28.68c0,2.81,2.28,5.1,5.08,5.1H43.8
          c2.8,0,5.08-2.29,5.08-5.1V5.1C48.88,2.29,46.6,0,43.8,0z M5.08,2H43.8c1.7,0,3.08,1.39,3.08,3.1v3.92H2V5.1C2,3.39,3.38,2,5.08,2z
           M43.8,36.87H5.08c-1.7,0-3.08-1.39-3.08-3.1V11.01h44.88v22.76C46.88,35.48,45.5,36.87,43.8,36.87z`}
            />
            <circle
              id="XMLID_22_"
              className="st0"
              cx="6.43"
              cy="5.63"
              r="2.02"
            />
            <ellipse
              id="XMLID_21_"
              className="st0"
              cx="12.54"
              cy="5.63"
              rx="2.02"
              ry="2.02"
            />
            <circle
              id="XMLID_20_"
              className="st0"
              cx="18.66"
              cy="5.63"
              r="2.02"
            />
            <g id="XMLID_16_">
              <circle
                id="XMLID_19_"
                className="st1"
                cx="30.33"
                cy="18.32"
                r="2.02"
              />
              <circle
                id="XMLID_18_"
                className="st1"
                cx="18.55"
                cy="18.32"
                r="2.02"
              />
              <path
                id="XMLID_17_"
                className="st1"
                d={`M32.35,30.71c-0.25,0-0.51-0.1-0.7-0.29c-1.75-1.73-4.37-2.73-7.2-2.73s-5.45,1-7.2,2.73
              c-0.39,0.39-1.03,0.39-1.41-0.01c-0.39-0.39-0.39-1.03,0.01-1.41c2.12-2.1,5.26-3.31,8.61-3.31s6.49,1.21,8.61,3.31
              c0.39,0.39,0.39,1.02,0.01,1.41C32.86,30.62,32.6,30.71,32.35,30.71z`}
              />
            </g>
          </g>
        </svg>
      </div>
      <h1>Our Console is not optimized for mobile.</h1>
      <p>Please open the console on a desktop screen.</p>
      <div>
        <a className="btn green" href="https://www.graph.cool" target="_blank">
          Visit our Homepage
        </a>
        <a className="btn" href="https://www.graph.cool/docs/">
          Read our Docs
        </a>
      </div>
    </div>
  )
}
