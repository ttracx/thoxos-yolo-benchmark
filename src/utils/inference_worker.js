import { InferenceSession, Tensor } from "onnxruntime-web/webgpu";

// Inference worker — loads ONNX model, warms up, then runs N inference cycles.
// Communicates via postMessage with typed status updates.
self.onmessage = async function (e) {
  const { model_path, backend, inferenceCount } = e.data;
  const DEFAULT_INPUT_SIZE = [1, 3, 640, 640];

  try {
    self.postMessage({
      type: "status",
      status: "Loading Model…",
      warmUpTime: 0,
      inferenceTime: 0,
    });

    const yolo_model = await InferenceSession.create(model_path, {
      executionProviders: [backend],
    });

    self.postMessage({
      type: "status",
      status: "Warming Up…",
      warmUpTime: 0,
      inferenceTime: 0,
    });

    const warmUpTime = await inference(yolo_model, DEFAULT_INPUT_SIZE);

    self.postMessage({
      type: "warmup",
      warmUpTime: parseFloat(warmUpTime),
      inferenceTime: 0,
      status: "Warm Up Complete",
    });

    for (let i = 0; i < inferenceCount; i++) {
      const inferenceTime = await inference(yolo_model, DEFAULT_INPUT_SIZE);

      self.postMessage({
        type: "inference",
        warmUpTime: parseFloat(warmUpTime),
        inferenceTime: parseFloat(inferenceTime),
        status: `Running ${i + 1}/${inferenceCount}…`,
      });
    }

    self.postMessage({
      type: "complete",
      warmUpTime: parseFloat(warmUpTime),
      inferenceTime: 0,
      status: `Benchmark Complete (${inferenceCount} runs)`,
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      warmUpTime: 0,
      inferenceTime: 0,
      status: `Error: ${error.message}`,
    });
  }
};

async function inference(session, input_size) {
  const start = performance.now();

  const dummy_input_tensor = new Tensor(
    "float32",
    new Float32Array(input_size.reduce((a, b) => a * b)),
    input_size
  );

  const { output0 } = await session.run({ images: dummy_input_tensor });

  output0.dispose();
  dummy_input_tensor.dispose();

  const end = performance.now();
  return (end - start).toFixed(2);
}