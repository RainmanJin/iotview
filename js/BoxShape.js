

/*
	The example shape is a "3D box" that looks like this:
	       ____
	      /   /|
	     /___/ |
	     |   | /
	     |___|/
		      
	The code below defines the shape. The BoxShape function
	it the constructor which creates a new object instance.
*/
function BoxShape()
{
	mxCylinder.call(this);
};

/*
	The next lines use an mxCylinder instance to augment the
	prototype of the shape ("inheritance") and reset the
	constructor to the topmost function of the c'tor chain.
*/
mxUtils.extend(BoxShape, mxCylinder);

// Defines the extrusion of the box as a "static class variable"
BoxShape.prototype.extrude = 10;
	
/*
	Next, the mxCylinder's redrawPath method is "overridden".
	This method has a isForeground argument to separate two
	paths, one for the background (which must be closed and
	might be filled) and one for the foreground, which is
	just a stroke.

     Foreground:       /
		 _____/
		      |
		      |
		   ____  
     Background:  /    | 
		 /     | 
		 |     / 
		 |____/ 
*/
BoxShape.prototype.redrawPath = function(path, x, y, w, h, isForeground)
{
	var dy = this.extrude * this.scale;
	var dx = this.extrude * this.scale;

	if (isForeground)
	{
		path.moveTo(0, dy);
		path.lineTo(w - dx, dy);
		path.lineTo(w, 0);
		path.moveTo(w - dx, dy);
		path.lineTo(w - dx, h);
	}
	else
	{
		path.moveTo(0, dy);
		path.lineTo(dx, 0);
		path.lineTo(w, 0);
		path.lineTo(w, h - dy);
		path.lineTo(w - dx, h);
		path.lineTo(0, h);
		path.lineTo(0, dy);
		path.lineTo(dx, 0);
		path.close();
	}
};

mxCellRenderer.registerShape('box', BoxShape);
