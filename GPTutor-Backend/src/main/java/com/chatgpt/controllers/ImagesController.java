package com.chatgpt.controllers;

import com.chatgpt.entity.GenerateImageRequest;
import com.chatgpt.entity.Image;
import com.chatgpt.entity.ImageComplaint;
import com.chatgpt.entity.ImageLike;
import com.chatgpt.services.ComplaintsService;
import com.chatgpt.services.ImageLikeService;
import com.chatgpt.services.ImagesService;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class ImagesController {
    private final ImagesService imagesService;
    private final ComplaintsService complaintsService;
    private final ImageLikeService imageLikeService;
    
    public ImagesController(ImagesService imagesService, ComplaintsService complaintsService, ImageLikeService imageLikeService) {
        this.imagesService = imagesService;
        this.complaintsService = complaintsService;
        this.imageLikeService = imageLikeService;
    }

    @PostMapping(path = "/image")
    List<Image> generateImage(@RequestBody GenerateImageRequest prompt, HttpServletRequest request) {
        return imagesService.generateImage((String) request.getAttribute("vkUserId"), prompt);
    }

    @PostMapping(path = "/image/generate")
    String[] generateImageWithoutCreate(@RequestBody GenerateImageRequest request) throws JsonProcessingException {
        return imagesService.getGeneratedImage(request).getFirst();
    }

    @GetMapping(path = "/image")
    Page<Image> getImages(HttpServletRequest request,
                          @RequestParam(defaultValue = "0") int pageNumber,
                          @RequestParam(defaultValue = "10") int pageSize) {

        return imagesService.getImages((String) request.getAttribute("vkUserId"),
                pageNumber,
                pageSize
        );
    }

    @GetMapping(path = "/publishing")
    Page<Image> getPublishingImages(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "50") int pageSize,
            @RequestParam(defaultValue = "") String queryOriginalPrompt) {

        return imagesService.getPublishingImages(
                queryOriginalPrompt,
                pageNumber,
                pageSize
        );
    }


    @GetMapping(path = "/image/{id}/base64")
    ResponseEntity<String> getImageBase64(@PathVariable("id") UUID imageId) {
        return ResponseEntity.ok().body(imagesService.getImageBase64(imageId));
    }

    @PostMapping(path = "/image/{id}/complaint")
    ResponseEntity<ImageComplaint> createComplaint(@PathVariable("id") UUID imageId, HttpServletRequest request) {
        return ResponseEntity.ok(complaintsService.createComplaint(imageId, (String) request.getAttribute("vkUserId")));
    }

    @PostMapping(path = "/image/{id}/like")
    ResponseEntity<ImageLike> createImageLike(@PathVariable("id") UUID imageId, HttpServletRequest request) {
        return ResponseEntity.ok(imageLikeService.createImageLike(imageId, (String) request.getAttribute("vkUserId")));
    }

}
