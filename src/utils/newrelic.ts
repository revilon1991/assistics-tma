export const initNewRelic = () => {
  if (import.meta.env.MODE !== 'production') {
    return;
  }

  // @ts-ignore
  window.NREUM || (window.NREUM = {});
  // @ts-ignore
  window.NREUM.init = {
    session_replay: {
      enabled: true,
      block_selector: '',
      mask_text_selector: '*',
      sampling_rate: 10.0,
      error_sampling_rate: 100.0,
      mask_all_inputs: true,
      collect_fonts: true,
      inline_images: false,
      inline_stylesheet: true,
      fix_stylesheets: true,
      preload: false,
      mask_input_options: {}
    },
    distributed_tracing: { enabled: true },
    performance: { capture_measures: true },
    browser_consent_mode: { enabled: false },
    privacy: { cookies_enabled: true },
    ajax: { deny_list: ["bam.eu01.nr-data.net"] }
  };

  // @ts-ignore
  window.NREUM.loader_config = {
    accountID: "7339691",
    trustKey: "7339691",
    agentID: "538783645",
    licenseKey: "NRJS-0fcb0359f75f75ec3a5",
    applicationID: "538783645"
  };

  // @ts-ignore
  window.NREUM.info = {
    beacon: "bam.eu01.nr-data.net",
    errorBeacon: "bam.eu01.nr-data.net",
    licenseKey: "NRJS-0fcb0359f75f75ec3a5",
    applicationID: "538783645",
    sa: 1
  };

  // Загрузка скрипта New Relic
  const script = document.createElement('script');
  script.src = 'https://js-agent.newrelic.com/nr-loader-spa-1.302.0.min.js';
  script.type = 'text/javascript';
  script.async = true;
  document.head.appendChild(script);

  console.log('New Relic initialized for production');
};

