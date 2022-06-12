// definition for a point quadtree. Useful every now and again.. especially when working with 2D grids ;)
export default class QuadTree {
  constructor(minx, miny, maxx, maxy) {
    this.minx = minx;
    this.miny = miny;
    this.maxx = maxx;
    this.maxy = maxy;
    this.midx = (this.minx + this.maxx) / 2;
    this.midy = (this.miny + this.maxy) / 2;

    this.bucket = [];
    this.nw = null;
    this.ne = null;
    this.sw = null;
    this.se = null;
  }

  insert(obj) {
    // first make sure that the object goes inside our region.
    if (
      obj.x < this.minx ||
      obj.x >= this.maxx ||
      obj.y < this.miny ||
      obj.y >= this.maxy
    ) {
      return false;
    }

    // if we have no children,
    if (!this.nw) {
      // if we have not filled our own bucket, add to it.
      if (this.bucket.length < 5) {
        this.bucket.push(obj);
        return true;
      }

      // if we fill our own bucket, split up.
      this.subdivide();
    }

    // try storing the object in one of our children.
    return (
      this.nw.insert(obj) ||
      this.ne.insert(obj) ||
      this.sw.insert(obj) ||
      this.se.insert(obj)
    );
  }

  subdivide() {
    // split up into four quadrants (child nodes)
    this.nw = new QuadTree(this.minx, this.miny, this.midx, this.midy);
    this.ne = new QuadTree(this.midx, this.miny, this.maxx, this.midy);
    this.sw = new QuadTree(this.minx, this.midy, this.midx, this.maxy);
    this.se = new QuadTree(this.midx, this.midy, this.maxx, this.maxy);

    // dump the contents of our bucket into our children
    for (var i = 0; i < this.bucket.length; i++) {
      this.insert(this.bucket[i]);
    }
    this.bucket = null;
  }

  inRegion(minx, miny, maxx, maxy) {
    // check that we overlap with the region
    if (
      maxx < this.minx ||
      minx >= this.maxx ||
      maxy < this.miny ||
      miny >= this.maxy
    ) {
      return [];
    }

    // if we have no children, return our bucket.
    // I decided not to copy the bucket, for speed reasons.
    if (!this.nw) return this.bucket;

    var found = [];

    // push the contents of our children into the array and return it
    found = found.concat(
      this.nw.inRegion(minx, miny, maxx, maxy),
      this.ne.inRegion(minx, miny, maxx, maxy),
      this.sw.inRegion(minx, miny, maxx, maxy),
      this.se.inRegion(minx, miny, maxx, maxy)
    );

    return found;
  }

  draw(canvas, ctx, minx, miny, maxx, maxy) {
    var midx = (minx + maxx) / 2;
    var midy = (miny + maxy) / 2;

    if (this.nw) {
      ctx.beginPath();
      ctx.moveTo(minx * canvas.drawWidth, midy * canvas.drawHeight);
      ctx.lineTo(maxx * canvas.drawWidth, midy * canvas.drawHeight);
      ctx.moveTo(midx * canvas.drawWidth, miny * canvas.drawHeight);
      ctx.lineTo(midx * canvas.drawWidth, maxy * canvas.drawHeight);
      ctx.closePath();
      ctx.strokeStyle = '#FF0000';
      ctx.stroke();

      this.nw.draw(canvas, ctx, minx, miny, midx, midy);
      this.ne.draw(canvas, ctx, midx, miny, maxx, midy);
      this.sw.draw(canvas, ctx, minx, midy, midx, maxy);
      this.se.draw(canvas, ctx, midx, midy, maxx, maxy);
    } else {
      for (var i = 0; i < this.bucket.length; i++) {
        var p = this.bucket[i];
        var x =
          minx + ((p.x - this.minx) / (this.maxx - this.minx)) * (maxx - minx);
        var y =
          miny + ((p.y - this.miny) / (this.maxy - this.miny)) * (maxy - miny);

        ctx.fillStyle = '#0000FF';
        ctx.fillRect(x * canvas.drawWidth, y * canvas.drawHeight, 1, 1);
      }
    }
  }
}
