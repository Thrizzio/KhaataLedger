'use client';

import { useState } from 'react';

export default function JavaScriptConceptsDemo() {
  const [output, setOutput] = useState<string[]>([]);
  const [count, setCount] = useState(0);

  
  function createCounter() {
    let value = 0;

    return function increment() {
      value++;
      return value;
    };
  }

  const closureCounter = createCounter();

  // 2. ASYNC/AWAIT
  async function demonstrateAsyncAwait() {
    setOutput((prev) => [...prev, 'Async operation started...']);

    const result = await new Promise<string>((resolve) => {
      setTimeout(() => resolve('Async operation completed'), 1000);
    });

    setOutput((prev) => [...prev, result]);
  }

  // 3. PROMISES VS CALLBACKS
  function demonstrateCallback() {
    setOutput((prev) => [...prev, 'Callback started']);

    setTimeout(() => {
      setOutput((prev) => [...prev, 'Callback completed']);
    }, 500);
  }

  function demonstratePromise() {
    setOutput((prev) => [...prev, 'Promise started']);

    Promise.resolve('Promise completed').then((result) => {
      setOutput((prev) => [...prev, result]);
    });
  }

  // 4. EVENT LOOP
  function demonstrateEventLoop() {
    setOutput([]);

    setOutput((prev) => [...prev, '1. Synchronous code']);

    setTimeout(() => {
      setOutput((prev) => [...prev, '3. setTimeout - task queue']);
    }, 0);

    Promise.resolve().then(() => {
      setOutput((prev) => [...prev, '2. Promise - microtask queue']);
    });
  }

  // 5. HOISTING
  function demonstrateHoisting() {
    // Function declarations are hoisted.
    const functionResult = hoistedFunction();

    // `var` is hoisted and initialized as undefined.
    var hoistedVar;

    setOutput([
      functionResult,
      `var before assignment: ${hoistedVar}`,
      'let/const are hoisted but remain in the Temporal Dead Zone until declaration.',
    ]);

    hoistedVar = 10;
  }

  function hoistedFunction() {
    return 'Function declaration works before its declaration.';
  }

  return (
    <main
      style={{
        maxWidth: 900,
        margin: '40px auto',
        padding: 24,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>JavaScript Concepts Demo</h1>

      <p>
        Small interactive demonstrations for JavaScript concepts used in
        frontend development.
      </p>

      {/* ASYNC/AWAIT */}
      <section style={{ marginTop: 32 }}>
        <h2>1. Async / Await</h2>

        <p>
          <code>await</code> waits for a Promise to settle without blocking
          the JavaScript thread.
        </p>

        <button onClick={demonstrateAsyncAwait}>
          Run Async/Await
        </button>
      </section>

      {/* CLOSURES */}
      <section style={{ marginTop: 32 }}>
        <h2>2. Closures</h2>

        <p>
          A closure allows an inner function to retain access to variables
          from its outer function.
        </p>

        <button
          onClick={() => {
            const value = closureCounter();
            setCount(value);
          }}
        >
          Increment Closure Counter
        </button>

        <p>Closure value: {count}</p>
      </section>

      {/* EVENT LOOP */}
      <section style={{ marginTop: 32 }}>
        <h2>3. Event Loop</h2>

        <p>
          Synchronous code executes first, followed by Promise microtasks,
          followed by timer tasks.
        </p>

        <button onClick={demonstrateEventLoop}>
          Run Event Loop Demo
        </button>
      </section>

      {/* HOISTING */}
      <section style={{ marginTop: 32 }}>
        <h2>4. Hoisting</h2>

        <p>
          JavaScript processes declarations before executing the code.
          Functions and variables behave differently when hoisted.
        </p>

        <button onClick={demonstrateHoisting}>
          Run Hoisting Demo
        </button>
      </section>

      {/* PROMISES VS CALLBACKS */}
      <section style={{ marginTop: 32 }}>
        <h2>5. Promises vs Callbacks</h2>

        <p>
          Both can handle asynchronous operations, but Promises provide a
          structured way to compose asynchronous operations and handle errors.
        </p>

        <button onClick={demonstrateCallback}>
          Run Callback
        </button>

        <button
          onClick={demonstratePromise}
          style={{ marginLeft: 10 }}
        >
          Run Promise
        </button>
      </section>

      {/* OUTPUT */}
      <section style={{ marginTop: 40 }}>
        <h2>Output</h2>

        <div
          style={{
            background: '#111',
            color: '#fff',
            padding: 20,
            borderRadius: 8,
            minHeight: 100,
          }}
        >
          {output.length === 0 ? (
            <span>No output yet.</span>
          ) : (
            output.map((line, index) => (
              <div key={index}>
                {line}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}