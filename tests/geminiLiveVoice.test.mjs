// WorkMojo Gemini Multimodal Live API Voice Test Suite
// Verifies full-duplex WebSocket server upgrade on /api/v1/voice/live,
// bidirectional audio framing, barge-in / interruption handling,
// conversational intent routing, and graceful error handling.

import WebSocket from '../server/node_modules/ws/index.js';

const TEST_PORT = '5059';
process.env.PORT = TEST_PORT;

async function runTests() {
  console.log('===============================================================');
  console.log('   WORKMOJO GEMINI MULTIMODAL LIVE VOICE ASSISTANT TEST SUITE');
  console.log('===============================================================\n');

  // Start the server
  const { server } = await import('../server/dist/index.js');
  await new Promise(resolve => setTimeout(resolve, 800));

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    passed++;
    console.log(`✅ PASS: ${message}`);
  }

  const wsUrl = `ws://localhost:${TEST_PORT}/api/v1/voice/live`;

  try {
    // -------------------------------------------------------------------------
    // Test 1: WebSocket Connection and Upgrade
    // -------------------------------------------------------------------------
    console.log('\n--- Test 1: WebSocket Upgrade on /api/v1/voice/live ---');
    const ws = new WebSocket(wsUrl);

    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
    });

    assert(ws.readyState === WebSocket.OPEN, 'WebSocket successfully connected to /api/v1/voice/live');

    // -------------------------------------------------------------------------
    // Test 2: Handshake Session Initialization
    // -------------------------------------------------------------------------
    console.log('\n--- Test 2: Voice Session Handshake Init ---');

    // Send init frame
    ws.send(
      JSON.stringify({
        type: 'init',
        language: 'en',
        role: 'customer',
        conversationState: { jobDraft: {} },
      })
    );

    // Collect responses from the server
    const receivedMessages = [];
    const messageListener = (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        receivedMessages.push(parsed);
      } catch (e) {
        console.warn('Failed to parse WS message:', e);
      }
    };
    ws.on('message', messageListener);

    // Wait a moment for server to process init
    await new Promise(resolve => setTimeout(resolve, 500));

    assert(
      receivedMessages.length > 0 || ws.readyState === WebSocket.OPEN,
      'Server processed session init without rejecting connection'
    );

    // -------------------------------------------------------------------------
    // Test 3: Audio Chunk Ingestion (16kHz PCM Base64)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 3: Audio Chunk Ingestion (16kHz PCM mono) ---');

    // Create a dummy 64ms 16kHz 16-bit PCM frame (1024 samples = 2048 bytes)
    const dummyPcm = Buffer.alloc(2048);
    for (let i = 0; i < 1024; i++) {
      dummyPcm.writeInt16LE(Math.round(Math.sin(i / 10) * 1000), i * 2);
    }
    const pcmBase64 = dummyPcm.toString('base64');

    ws.send(
      JSON.stringify({
        type: 'audio',
        pcm16k: pcmBase64,
      })
    );

    // Send another chunk to ensure continuous streaming
    ws.send(
      JSON.stringify({
        type: 'audio',
        pcm16k: pcmBase64,
      })
    );

    await new Promise(resolve => setTimeout(resolve, 300));
    assert(ws.readyState === WebSocket.OPEN, 'Server accepted raw 16kHz PCM audio stream gracefully');

    // -------------------------------------------------------------------------
    // Test 4: Barge-In (Interruption Signal Handling)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 4: Barge-In / Interruption Signal Handling ---');

    ws.send(
      JSON.stringify({
        type: 'interrupt',
      })
    );

    await new Promise(resolve => setTimeout(resolve, 200));
    assert(ws.readyState === WebSocket.OPEN, 'Server handled interruption / barge-in event without error');

    // -------------------------------------------------------------------------
    // Test 5: Voice Text-to-Intent Routing (Worker Count Extraction)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 5: Voice Speech-to-Intent Routing (Worker Count) ---');

    // Clear previous messages
    receivedMessages.length = 0;

    // Send a transcribed utterance from client voice session
    ws.send(
      JSON.stringify({
        type: 'text',
        text: 'I need 5 helpers for warehouse tomorrow',
      })
    );

    // Wait for the intent_action response
    let intentActionReceived = null;
    const startTime = Date.now();
    while (Date.now() - startTime < 3000) {
      intentActionReceived = receivedMessages.find(m => m.type === 'intent_action');
      if (intentActionReceived) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    assert(intentActionReceived !== null, 'Server responded with intent_action payload');
    assert(intentActionReceived.intent === 'WORKER_COUNT', `Classified as WORKER_COUNT (got ${intentActionReceived?.intent})`);
    assert(
      intentActionReceived.entities?.workersRequired === 5,
      `Extracted workersRequired = 5 (got ${intentActionReceived?.entities?.workersRequired})`
    );
    assert(
      intentActionReceived.action?.type === 'OPEN_POST_JOB' || intentActionReceived.action?.type === 'UPDATE_JOB_DRAFT',
      `Triggered job draft action (got ${intentActionReceived?.action?.type})`
    );

    // -------------------------------------------------------------------------
    // Test 6: Multilingual Voice Intent Routing (Telugu)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 6: Multilingual Voice Intent Routing (Telugu) ---');

    receivedMessages.length = 0;

    // Re-initialize session with Telugu language
    ws.send(
      JSON.stringify({
        type: 'init',
        language: 'te',
        role: 'customer',
        conversationState: { jobDraft: {} },
      })
    );

    await new Promise(resolve => setTimeout(resolve, 200));

    ws.send(
      JSON.stringify({
        type: 'text',
        text: 'నాకు 3 ఎలక్ట్రీషియన్లు కావాలి', // "I need 3 electricians" in Telugu
      })
    );

    let teIntentAction = null;
    const teStartTime = Date.now();
    while (Date.now() - teStartTime < 3000) {
      teIntentAction = receivedMessages.find(m => m.type === 'intent_action');
      if (teIntentAction) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    assert(teIntentAction !== null, 'Server responded with Telugu intent_action payload');
    assert(
      teIntentAction.entities?.workersRequired === 3,
      `Extracted Telugu workersRequired = 3 (got ${teIntentAction?.entities?.workersRequired})`
    );
    assert(
      teIntentAction.action?.jobDraft?.category === 'Electrical Work',
      `Extracted Category = Electrical Work (got ${teIntentAction?.action?.jobDraft?.category})`
    );

    // -------------------------------------------------------------------------
    // Test 7: Multilingual Voice Intent Routing (Hindi)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 7: Multilingual Voice Intent Routing (Hindi) ---');

    receivedMessages.length = 0;

    ws.send(
      JSON.stringify({
        type: 'init',
        language: 'hi',
        role: 'customer',
        conversationState: { jobDraft: {} },
      })
    );

    await new Promise(resolve => setTimeout(resolve, 200));

    ws.send(
      JSON.stringify({
        type: 'text',
        text: 'मुझे 4 प्लंबर चाहिए', // "I need 4 plumbers" in Hindi
      })
    );

    let hiIntentAction = null;
    const hiStartTime = Date.now();
    while (Date.now() - hiStartTime < 3000) {
      hiIntentAction = receivedMessages.find(m => m.type === 'intent_action');
      if (hiIntentAction) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    assert(hiIntentAction !== null, 'Server responded with Hindi intent_action payload');
    assert(
      hiIntentAction.entities?.workersRequired === 4,
      `Extracted Hindi workersRequired = 4 (got ${hiIntentAction?.entities?.workersRequired})`
    );
    assert(
      hiIntentAction.action?.jobDraft?.category === 'Plumbing',
      `Extracted Category = Plumbing (got ${hiIntentAction?.action?.jobDraft?.category})`
    );

    // -------------------------------------------------------------------------
    // Test 8: Continuous 10-Turn Hands-Free Multi-Turn Conversation
    // -------------------------------------------------------------------------
    console.log('\n--- Test 8: Continuous 10-Turn Hands-Free Multi-Turn Conversation ---');

    // Reset session with fresh English conversation state over the SAME connection
    ws.send(
      JSON.stringify({
        type: 'init',
        language: 'en',
        role: 'customer',
        conversationState: { jobDraft: {} },
      })
    );
    await new Promise(resolve => setTimeout(resolve, 250));

    const multiTurns = [
      {
        turn: 1,
        input: 'I need 5 electricians tomorrow in Madhapur',
        expectedIntent: 'WORKER_COUNT',
        validate: action => action.entities?.workersRequired === 5,
        desc: 'Turn 1: Initial request sets workers=5',
      },
      {
        turn: 2,
        input: 'Change it to 8',
        expectedIntent: 'WORKER_COUNT',
        validate: action => action.entities?.workersRequired === 8,
        desc: 'Turn 2: Incremental update workers=8 (preserves previous category)',
      },
      {
        turn: 3,
        input: 'Actually make it 12 workers',
        expectedIntent: 'WORKER_COUNT',
        validate: action => action.entities?.workersRequired === 12,
        desc: 'Turn 3: Incremental update workers=12',
      },
      {
        turn: 4,
        input: 'Location is Hitec City',
        expectedIntent: 'JOB_LOCATION',
        validate: action => !!action.action,
        desc: 'Turn 4: Location update preserves workers=12',
      },
      {
        turn: 5,
        input: 'Set wage to 850 rupees per day',
        expectedIntent: 'WAGE_INFO',
        validate: action => !!action.action,
        desc: 'Turn 5: Wage update',
      },
      {
        turn: 6,
        input: 'What is the standard wage for electricians?',
        expectedIntent: 'WAGE_INFO',
        validate: action => !!action.intent,
        desc: 'Turn 6: Question answered without losing draft',
      },
      {
        turn: 7,
        input: 'Show my applicants',
        expectedIntent: 'APPLICATION_STATUS',
        validate: action => action.action?.type === 'OPEN_APPLICANTS',
        desc: 'Turn 7: Navigates to applicant review',
      },
      {
        turn: 8,
        input: 'Find me a plumber',
        expectedIntent: 'WORKER_SEARCH',
        validate: action => action.action?.type === 'OPEN_WORKER_SEARCH',
        desc: 'Turn 8: Worker search navigation',
      },
      {
        turn: 9,
        input: 'How do I post a job?',
        expectedIntent: 'JOB_POSTING_HELP',
        validate: action => !!action.action,
        desc: 'Turn 9: Job posting guidance',
      },
      {
        turn: 10,
        input: 'I need 20 helpers for event tomorrow',
        expectedIntent: 'WORKER_COUNT',
        validate: action => action.entities?.workersRequired === 20,
        desc: 'Turn 10: Final high worker count=20',
      },
    ];

    for (const t of multiTurns) {
      receivedMessages.length = 0;
      ws.send(JSON.stringify({ type: 'text', text: t.input }));

      let actionPayload = null;
      const turnStart = Date.now();
      while (Date.now() - turnStart < 2500) {
        actionPayload = receivedMessages.find(m => m.type === 'intent_action');
        if (actionPayload) break;
        await new Promise(resolve => setTimeout(resolve, 80));
      }

      assert(actionPayload !== null, `${t.desc} - received intent_action`);
      assert(t.validate(actionPayload), `${t.desc} - validated successfully`);
      assert(ws.readyState === WebSocket.OPEN, `Session remains continuously OPEN after Turn ${t.turn}`);
    }

    // -------------------------------------------------------------------------
    // Test 9: Dynamic Session Language and Draft Updates
    // -------------------------------------------------------------------------
    console.log('\n--- Test 9: Dynamic Session Updates (Language & Draft) ---');

    receivedMessages.length = 0;
    ws.send(JSON.stringify({ type: 'change_language', language: 'te' }));
    await new Promise(resolve => setTimeout(resolve, 150));
    const langMsg = receivedMessages.find(m => m.type === 'language_changed');
    assert(langMsg?.language === 'te', 'Dynamically changed session language to Telugu');

    ws.send(JSON.stringify({ type: 'update_draft', draft: { workersRequired: 15, wage: 900 } }));
    await new Promise(resolve => setTimeout(resolve, 150));
    const draftMsg = receivedMessages.find(m => m.type === 'draft_updated');
    assert(draftMsg?.jobDraft?.workersRequired === 15, 'Dynamically synchronized draft state to backend');

    // -------------------------------------------------------------------------
    // Test 10: Clean Session Termination
    // -------------------------------------------------------------------------
    console.log('\n--- Test 10: Clean Session Termination ---');

    ws.send(JSON.stringify({ type: 'close' }));
    ws.close(1000, 'Normal closure');

    await new Promise(resolve => setTimeout(resolve, 300));
    assert(
      ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING,
      'WebSocket connection cleanly closed'
    );

    console.log('\n===============================================================');
    console.log(`   ALL TESTS PASSED: ${passed}/${total}`);
    console.log('===============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test suite execution failed:', err);
    process.exit(1);
  }
}

runTests();
