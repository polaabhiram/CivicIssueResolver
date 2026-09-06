def combine_predictions(text_label, text_conf, img_label, img_conf):

    # Case 1: Same prediction
    if text_label == img_label:
        return text_label

    # Case 2: Choose higher confidence
    if text_conf > img_conf:
        return text_label
    else:
        return img_label