PYTHON_PLOT_HOOK = r"""
# will be written as plot_hook.py
import matplotlib.pyplot as plt
import plotly.graph_objects as go
import uuid
import os

# create a directory to save outputs
OUTPUT_DIR = "output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_uuid_filename(prefix, ext):
    unique_id = uuid.uuid4()
    filename = f"{prefix}_{unique_id}.{ext}"
    print(f"\n<[Hook]-[{unique_id}]>\n")
    return os.path.join(OUTPUT_DIR, filename)

def patch_all():
    # Patch matplotlib's plt.show()
    def mpl_show_patch(*args, **kwargs):
        fname = generate_uuid_filename("matplotlib", "png")
        plt.savefig(fname)

    # Patch plotly's go.Figure.show()
    def plotly_show_patch(self, *args, **kwargs):
        fname = generate_uuid_filename("plotly", "html")
        self.write_html(fname, include_plotlyjs="cdn")

    # Apply patches
    plt.show = mpl_show_patch
    go.Figure.show = plotly_show_patch
"""

R_PLOT_HOOK = r"""
# Will be written as plot_hook.R
if (!dir.exists("output")) dir.create("output")

library(ggplot2)
library(uuid)
library(plotly)
library(htmlwidgets)
library(rgl)

# Patch base plot
original_plot <- base::plot
plot <- function(...) {
  uid <- UUIDgenerate()
  message(sprintf("<[Hook]-[%s]>", uid))
  png(sprintf("output/baseR_%s.png", uid))
  original_plot(...)
  dev.off()
}

# Patch ggplot2's print
registerS3method("print", "ggplot", function(x, ...) {
  uid <- UUIDgenerate()
  message(sprintf("<[Hook]-[%s]>", uid))
  ggsave(sprintf("output/ggplot2_%s.png", uid), plot = x)
}, envir = as.environment("package:ggplot2"))

# Patch plotly's print
registerS3method("print", "plotly", function(x, ...) {
  uid <- UUIDgenerate()
  file_path <- sprintf("output/plotly_%s.html", uid)
  message(sprintf("<[Hook]-[%s]>", uid))
  saveWidget(x, file = file_path, selfcontained = TRUE)
  invisible(x)
}, envir = as.environment("package:plotly"))

# Function to export the current rgl scene
autoExportRGLScene <- function() {
  uid <- UUIDgenerate()
  file_path <- sprintf("output/rgl_%s.html", uid)
  message(sprintf("<[Hook]-[%s]>", uid))
  widget <- rgl::rglwidget()
  saveWidget(widget, file = file_path, selfcontained = TRUE)
}

# Wrap plot3d
original_plot3d <- rgl::plot3d
plot3d <- function(...) {
  original_plot3d(...)
  autoExportRGLScene()
}

# Wrap points3d
original_points3d <- rgl::points3d
points3d <- function(...) {
  original_points3d(...)
  autoExportRGLScene()
}

# Wrap lines3d
original_lines3d <- rgl::lines3d
lines3d <- function(...) {
  original_lines3d(...)
  autoExportRGLScene()
}

# Wrap surface3d
original_surface3d <- rgl::surface3d
surface3d <- function(...) {
  original_surface3d(...)
  autoExportRGLScene()
}


# Patch print.rglwidget
registerS3method("print", "rglwidget", function(x, ...) {
  uid <- UUIDgenerate()
  file_path <- sprintf("output/rglwidget_%s.html", uid)
  message(sprintf("<[Hook]-[%s]>", uid))
  saveWidget(x, file = file_path, selfcontained = TRUE)
  invisible(x)
}, envir = as.environment("package:rgl"))

"""
