// SageMath Interactive Cayley Graph Explorer
// Complete implementation from Jupyter notebook

from sage.all import *
from ipywidgets import interact, interactive, fixed, interact_manual, Layout
from IPython.display import display, HTML, clear_output
import ipywidgets as widgets

// --- Core Function: Generates and plots the Cayley graph ---
def generate_cayley_graph_and_get_plot_data(group_name, group_param, generators_str):
    """
    Generates the Cayley graph for a given finite group and its generators,
    and returns the graph object, group object, and vertex labels for plotting.
    """
    try:
        G = None
        s_generators = []
        parsed_generators = []
        if generators_str:
            try:
                gen_list_str = f"[{generators_str}]"
                parsed_generators = eval(gen_list_str)
                if not isinstance(parsed_generators, list) or not all(isinstance(g, tuple) for g in parsed_generators):
                    raise ValueError("Generators must be a comma-separated list of tuples.")
            except Exception as e:
                print(f"Error parsing generators: {e}. Please use format like (1,2), (1,2,3)")
                return None, None, None

        // Determine group type and instantiate it
        if group_name == "DihedralGroup":
            if not isinstance(group_param, int):
                print("Error: For DihedralGroup, the 'group_param' must be an integer 'n'.")
                return None, None, None
            n = group_param
            G = DihedralGroup(n)
            s_generators = [G.gen(0), G.gen(1)] 
            print(f"Dihedral Group D_{n} created with default generators {s_generators}.")

        elif group_name == "SymmetricGroup":
            if not isinstance(group_param, int):
                print("Error: For SymmetricGroup, the 'group_param' must be an integer 'n'.")
                return None, None, None
            if not parsed_generators:
                print("Error: For SymmetricGroup, please provide generators.")
                return None, None, None

            G = SymmetricGroup(group_param)
            print(f"Symmetric Group S_{group_param} created.")
            s_generators = [Permutation(g) for g in parsed_generators]
            print(f"Provided generators: {s_generators}.")

        elif group_name == "AlternatingGroup":
            if not isinstance(group_param, int):
                print("Error: For AlternatingGroup, the 'group_param' must be an integer 'n'.")
                return None, None, None
            if not parsed_generators:
                print("Error: For AlternatingGroup, please provide generators.")
                return None, None, None
            
            G = AlternatingGroup(group_param)
            print(f"Alternating Group A_{group_param} created.")
            s_generators = [Permutation(g) for g in parsed_generators]
            print(f"Provided generators: {s_generators}.")

        else:
            print(f"Error: Group '{group_name}' not supported yet.")
            return None, None, None

        // Check if generators are valid members of the group
        valid_generators = []
        for gen_s in s_generators:
            if gen_s in G:
                valid_generators.append(gen_s)
            else:
                print(f"Warning: Generator {gen_s} is not a valid element of {G}. Skipping.")
        
        if not valid_generators:
            print("No valid generators provided or found. Cannot compute Cayley graph.")
            return None, None, None

        // Compute the Cayley graph
        cayley_graph = G.cayley_graph(generators=valid_generators)
        
        print(f"Cayley Graph for {G} with generators {valid_generators} computed.")
        print(f"Number of vertices: {cayley_graph.order()}")
        print(f"Number of edges: {cayley_graph.size()}")

        // Create vertex labels dictionary
        vertex_labels_dict = {element: str(element) for element in list(G)}
        
        return cayley_graph, G, vertex_labels_dict

    except Exception as e:
        print(f"An error occurred: {e}")
        return None, None, None

// --- Interactive UI Elements ---
// Global variables to store the current graph and group for highlighting
current_cayley_graph = None
current_group = None
current_vertex_labels = {}
current_plot_object = None

// Output widget to display the graph and messages
output_area = widgets.Output(layout=Layout(border='1px solid black', margin='10px 0'))

// Create UI controls
group_selector = widgets.Dropdown(
    options=['SymmetricGroup', 'DihedralGroup', 'AlternatingGroup'],
    value='SymmetricGroup',
    description='Group Type:',
    style={'description_width': 'initial'}
)

group_param_input = widgets.IntText(
    value=3,
    description='Group Parameter (n):',
    min=2,
    style={'description_width': 'initial'}
)

generators_input = widgets.Textarea(
    value='(1,2), (1,2,3)',
    description='Generators (e.g., (1,2), (1,2,3)):',
    layout=Layout(width='auto', height='80px'),
    style={'description_width': 'initial'}
)

generate_button = widgets.Button(description='Generate Cayley Graph', button_style='primary')

// Create highlighting controls
subgroup_selector = widgets.Dropdown(
    options=[],
    description='Highlight Subgroup:',
    disabled=True,
    style={'description_width': 'initial'}
)

coset_type_selector = widgets.RadioButtons(
    options=['None', 'Left Cosets', 'Right Cosets'],
    value='None',
    description='Coset Type:',
    disabled=True,
    style={'description_width': 'initial'}
)

center_button = widgets.Button(description='Highlight Center', disabled=True)
clear_highlight_button = widgets.Button(description='Clear Highlights', disabled=True)

// Display the complete interface
ui_elements = widgets.VBox([
    widgets.HBox([group_selector, group_param_input]),
    generators_input,
    generate_button,
    output_area,
    widgets.HBox([subgroup_selector, coset_type_selector]),
    widgets.HBox([center_button, clear_highlight_button])
])

print("Interactive Cayley Graph Explorer loaded!")
print("Configure your group settings above and click 'Generate Cayley Graph' to begin.")
display(ui_elements)

// Note: Event handlers and plotting functions would be defined here
// This is a simplified version for web display
