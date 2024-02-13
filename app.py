from flask import Flask, render_template, request, jsonify, abort
import helpers as hlprs
import numpy as np
import pickle
import cv2
import base64

app = Flask(__name__)

@app.route('/')
def render_html():
    return render_template('index.html')

@app.route('/process_image', methods=['POST'])
def process_image():
    data = request.get_json()
    image_data = data.get('imageData')
    image_height = data.get('imageHeight')
    image_width = data.get('imageWidth')
    image_process = data.get('imageProcess')
    translate_distances = data.get('imageTranslateDistances')
    image_width_selected = data.get('imageWidthSelected')
    image_height_selected = data.get('imageHeightSelected')
    image_rotate_angle = data.get('imageRotateAngle')
    image_colour_choice = data.get('imageColourChoice')
    image_current_colour_scheme = data.get('imageCurrentColourScheme')
    image_simple_threshold = data.get('imageselectedSimpleThreshold')
    image_threshold_value = data.get('imagethresholdValue')
    image_threshold_max = data.get('imagethresholdMax')
    image_affine_transform = data.get('imageAffineTransform')
    image_adaptive_paramaters = data.get('imageAdaptiveParamaters')                     
                               

    # print(image_data)
    pixel_data = image_data['data']
    pixel_data = np.array(list(pixel_data.values()))

    red_array = pixel_data[2::4]
    green_array = pixel_data[1::4]
    blue_array = pixel_data[::4]

    rgb_image_array = np.column_stack((red_array, green_array, blue_array)).reshape(image_width,image_height,3).astype(np.uint8)

    # Save the image data as a pickle file
    # pickle_file_path = 'image_data_before.pickle'   
    # with open(pickle_file_path, 'wb') as file:
    #     pickle.dump(rgb_image_array , file)
    
    histr = ''
    
    # Process the image data in your Python script
    if image_process == 'resize':
        image_data_array_edited = hlprs.resize_image(rgb_image_array,image_width_selected,image_height_selected)
    if image_process == 'translate':
        image_data_array_edited = hlprs.translate_image(rgb_image_array,translate_distances)
    if image_process == 'affine':
        image_data_array_edited = hlprs.affine_transformation(rgb_image_array, image_affine_transform)
    if image_process == 'swapColour':
        image_data_array_edited = hlprs.swap_colour(rgb_image_array,image_colour_choice,image_current_colour_scheme)
    if image_process == 'crop':
        image_data_array_edited = rgb_image_array
    if image_process == 'rotate':
        image_data_array_edited = hlprs.rotate_image(rgb_image_array,image_rotate_angle)
    if image_process == 'grayscale':
        image_data_array_edited = hlprs.convert_to_grayscale(rgb_image_array)
    if image_process == 'blur':
        image_data_array_edited = hlprs.gaussian_blur(rgb_image_array)
    if image_process == 'simpleThresh':
        image_data_array_edited = hlprs.simple_thresh(rgb_image_array,image_simple_threshold,image_threshold_value,image_threshold_max)
    if image_process == 'adaptThresh':
        image_data_array_edited = hlprs.adapt_thresh(rgb_image_array,image_adaptive_paramaters)
    if image_process == 'imageHist':
        image_data_array_edited, histr = hlprs.get_hist(rgb_image_array)
        histr = [hist.flatten().tolist() for hist in histr]
    if image_process == 'histEqua':
        image_data_array_edited, histr = hlprs.hist_equalization(rgb_image_array)
        histr = [hist.flatten().tolist() for hist in histr]
        
    # Specify the file path where you want to save the pickle file
    # pickle_file_path = 'image_data_after.pickle'
    # with open(pickle_file_path, 'wb') as file:
    #     pickle.dump(image_data_array_edited, file)
    
    # pickle_file_path = 'image_data_after_histr.pickle'
    # with open(pickle_file_path, 'wb') as file:
    #     pickle.dump(histr, file)

    # Convert the NumPy array to a base64-encoded string
    _, buffer = cv2.imencode('.png', image_data_array_edited)
    image_data = base64.b64encode(buffer).decode('utf-8')
    
    # Dummy response for demonstration purposes
    response = {'status': 'success', 'img': image_data, 'currentColourScheme':image_colour_choice, 'histogramVals': histr}
    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)


#http://127.0.0.1:5000
    
