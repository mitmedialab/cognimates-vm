//Animation Help Functions

/**
 * Trivial interpolation.
 * Find alternative curves at https://gist.github.com/gre/1650294
 * @param parcent {number} Value from 0.0 to 1.0
 */

linearInterpolate(percent) {
    return percent;
  }
animateBlock(block, dx, dy, seconds, optionalInterpolateFn) {
    let interpolate = optionalInterpolateFn || linearInterpolate;
    let dt = seconds * 1000; // Convert to milliseconds.
    let start = Date.now();
    var movedX = 0, movedY = 0;

    let step = function() {
      let now = Date.now();
      let percent = (now - start) / dt;
      if (percent < 1.0) {
        let stepX = interpolate(percent) * dx - movedX;
        let stepY = interpolate(percent) * dy - movedY;
        block.moveBy(stepX, stepY);
        movedX += stepX;
        movedY += stepY;
        window.requestAnimationFrame(step);  // repeat
      } else {
        // Complete the animation.
        block.moveBy(dx - movedX, dy - movedY);
      }
    }
    step();
  }
  module.exports(animateBlock);