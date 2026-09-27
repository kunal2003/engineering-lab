# Precision Lab

## Question
Can a tiny trained classifier retain its decisions while using fewer bytes for its weights?

## Implementation
A NumPy MLP trains on 1,536 concentric-ring points. It has input size 2, two 16-unit ReLU hidden layers, and a two-class softmax output: 354 trainable parameters. Adam runs 900 full-batch epochs at learning rate 0.012. Initialization seed 42, training seed 101 and test seed 202 are independent and recorded.

Each layer is quantized symmetrically using its largest absolute weight as a scale. Signed int8 and signed int4 are stored in two's complement; two 4-bit values occupy a byte. Biases remain float32. The KML1 header identifies format and precision, followed by dimensions, scale, weights and biases. The decoder validates header, shapes, scale, bounds and trailing data.

## Measured result
| Weight storage | Complete file | Test accuracy |
|---|---:|---:|
| Float32 | 1,460 B | 512/512 |
| Int8 | 500 B | 512/512 |
| Int4 | 340 B | 512/512 |

4-bit storage is 76.7% smaller than the float32 file. This particular test distribution is easy enough that quantization has no observed classification effect. The canvas renders actual model probabilities on a coordinate grid; dots show 180 test samples. Clicking evaluates that coordinate.

## Benchmark contract
`node scripts/benchmark.mjs` warms up inference and records 15 trials of 512 predictions for each precision. Browser timing uses 9 trials of 20 repeated 512-point batches and reports the median batch time. Device, JIT, timer resolution and thermal state affect timings; submillisecond differences should not be interpreted as meaningful speed gains.

All inference uses JavaScript numbers after dequantizing weights. Packing reduces storage; this implementation does not perform integer arithmetic kernels and makes no hardware acceleration claim. Probability is model output, not calibrated confidence. No comparison with Apple or NVIDIA products is made.

## Failure modes and next work
Per-layer scales can erase small weights when one outlier dominates. Test points are generated from the same distribution as training; different geometries and noise levels may fail. Add per-channel quantization and distribution-shift evaluation before claiming general robustness.
