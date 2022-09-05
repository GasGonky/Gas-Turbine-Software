# Gas-Turbine-Software
Software to digitise compressor maps, and model a gas turbine.

## Compressor Mapper
This software allows you to trace over a compressor map's efficiency and speed curves, so that the Compressor Reader code can interpolate between the curves and estimate the efficiency of a compressor at an arbitrary point on the compressor map.

1. Enter a URL to the compressor map image and the name of the compressor
2. Enter the pixel coordinates of the top left pixel of the graph (the pixel is on the axis) as the graph start pixel
3. Enter the pixel coordinates of the bottom right pixel of the graph (again, the bottom right pixel on the axis)
4. Enter the width and height of the graph in the graph units e.g. kg/s
5. Add a new curve using the 'New Curve' button
6. Trace a curve on the compressor map (Note that you can make the curve closed by clicking the 'O' button. It will turn to 'C' to indicate the change)
7. Enter the value associated with the curve in the 'VAL' box for the curve
8. If the curve is an efficiency curve, click the 'SP' button. It will turn to 'EF' to indicate the change in the curve type.
9. If the green normal lines are pointed outwards, click the 'REV' button to reverse the direction of the lines. (Note that this works by reversing the order of the points in the curve, so any further points you add will be added to the other end of the curve)
10. Repeat for remaining curves
11. Click the 'Export' button and copy the text underneath the curve list
12. Paste the text into a text file

Several example output files are in the CompressorMaps folder

## CompressorReader.js
This javascript file does the job of interpolating between efficiency curves for the Gas Turbine Model

It works by determining which curves a given point lies between, and then linearly interpolating between the two associated values of the curves using a distance weighted average.

## Gas Turbine Model
This is a model for a gas turbine. It uses equations provided by NASA to determine the net power output of a gas turbine, with the compressor efficiency being read from a compressor map.

!! I AM NOT AN EXPERT IN COMRPESSORS OR GAS TURBINES, SO TAKE ANY OUTPUTS FROM THE MODEL WITH A PINCH OF SALT !!

NASA equations:

• https://www.grc.nasa.gov/WWW/K-12/airplane/compth.html

• https://www.grc.nasa.gov/WWW/K-12/airplane/burnth.html

• https://www.grc.nasa.gov/WWW/K-12/airplane/powtrbth.html

Compressor Dicharge Temperature (Eq. 15.9)
https://archive.org/details/122207008GasConditioningAndProcessingVolume2JohnCampbellCo/page/n217/mode/1up?view=theater&page=218

Turbine Discharge Temperature (Eq. 16.7)
https://archive.org/details/122207008GasConditioningAndProcessingVolume2JohnCampbellCo/page/n217/mode/1up?view=theater&page=269
