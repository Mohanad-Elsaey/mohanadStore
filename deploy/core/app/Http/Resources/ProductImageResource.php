<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductImageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'image_path' => $this->image_path ? (str_starts_with($this->image_path, 'http') ? $this->image_path : asset($this->image_path)) : null,
            'is_main' => (bool)$this->is_main,
            'order' => $this->order,
        ];
    }
}
